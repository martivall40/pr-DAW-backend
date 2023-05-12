'use strict';
const CronJob = require("node-cron");
require('dotenv').config()
const uri = process.env.MONGODB_URI

const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient(uri);

var free = true

const actualitzarDades = async () => {
  try {
    if(free){
      free = false
      
        // Connect to the MongoDB server
        await client.connect();
      
        const db = client.db();
        const dbName = db.databaseName;

        // comprovar ultima dada

        const last = await client.db(dbName).collection('prices').find().sort({date:-1}).limit(1).toArray()

        let fer = false

        if (last.length > 0) {
          const data = last[0].date
          const avui = new Date()
                  
          if (data){
            const same = avui.getFullYear() === data.getFullYear() &&
            avui.getMonth() === data.getMonth() &&
            avui.getDate() === data.getDate()

            console.log("> Proces: Mateix dia:",same)
            fer = !same
          }

        } else {
          // console.log('No documents found.');
          fer = true
        }

        if(fer) {

          console.log("> Proces: Afegint dades...")
          console.log("> Date:", new Date().toLocaleString());

          let data = {}
          let dataAVG = {}
          let resposta = false
          
          // api preu hores
          try{
            const res = await fetch('https://api.preciodelaluz.org/v1/prices/all?zone=PCB')
            data = await res.json()
            // mitjana
            const resAVG = await fetch('https://api.preciodelaluz.org/v1/prices/avg?zone=PCB')
            dataAVG = await resAVG.json()
            resposta = true
          }
          catch(e){
            console.log("> Proces: Ha patat la API 1")

            const res = await fetch('https://api.esios.ree.es/indicators/1001')
            const dades = await res.json()

            if(dades.Status == 403){
              console.log("> Proces: Ha fallat la connexió API 2")
              console.log("> Proces: Reintentant...")
              free = true
              setTimeout(actualitzarDades,Math.floor(Math.random() * 20000))
            }else{
              // console.log(dades.indicator.values)
              // console.log(dades)
              
              let firstWord = dades.indicator.short_name.replace(/ .*/,'');
              let currentDate = ''
              let n = 0
              let sum = 0
              for (const key in dades.indicator.values) {
                const val = dades.indicator.values[key]
                if (val.geo_name === 'Península'){
                    // console.log(val)
                    let date = new Date(val.datetime)

                    let hour = date.getHours()
                    let dataKey = ("0" + hour).slice(-2)+'-'+("0" + ++hour).slice(-2)

                    currentDate = `${date.getDate().toString().padStart(2, '0')}-${date.getMonth().toString().padStart(2, '0')}-${date.getFullYear()}`


                    data[dataKey] = {
                      date: currentDate,
                      hour: dataKey,
                      market: firstWord,
                      price: val.value,
                      units: '€/Mwh'
                    }
                    n++
                    sum+=val.value
                }
              }

              dataAVG = {
                date: currentDate,
                price: sum/n
              }
              resposta = true

              // console.log(data)
              // console.log(dataAVG)
            }

          }
          
          // console.log("dades")
          // console.log(data)
          // console.log(dataAVG)
          // console.log(dataAVG.date)
          // agafar i tractar preu mitjana
          if (resposta) {
            const preuAVG = Math.round((dataAVG.price / 10) * 10) / 10

            const hores = []
            const preu = []

            const taulaDades = { type: 'bar' }
            const taulaOp = 'width=1000&height=600'

            // Recorre hores objecte
            for (const key in data) {
              const val = data[key]
              // console.log(`${val.hour}: ${val.price / 10}`)

              hores.push(val.hour)
              const price = Math.round((val.price / 10) * 10) / 10
              preu.push(price.toFixed(1))
            }
            // llista x linia avg i colors
            const preuAVGL = preu.map((el, ind) => (ind === 0) ? preuAVG : (ind + 1 === preu.length) ? preuAVG : null)
            const colors = preu.map((el, ind) => (preu[ind] < preuAVG) ? 'green' : 'red')

            // taulaDades.data.labels = hores
            // taulaDades.data.datasets = [{ label: 'preuEl', data: preu }]

            // propietats grafic
            taulaDades.data = { labels: hores, datasets: [{ label: 'preu', data: preu, backgroundColor: colors }] }
            taulaDades.data.datasets.push({ label: `mitjana: ${preuAVG}`, type: 'line', data: preuAVGL, fill: false, spanGaps: true })
            // titol horitzontal i vertical
            taulaDades.options = { scales: { xAxes: [{ scaleLabel: { display: true, labelString: 'Hores' } }] } }
            taulaDades.options.scales = { ...taulaDades.options.scales, yAxes: [{ scaleLabel: { display: true, labelString: 'c€/KWh' } }] }
            taulaDades.options.plugins = { datalabels: { display: true, font: { size: 12 }, anchor: 'end', align: 'top' } }
            taulaDades.options.title = { display: true, text: `Preu electricitat ${dataAVG.date}` }

            const link = `https://quickchart.io/chart?${taulaOp}&c=${JSON.stringify(taulaDades)}`

            // guardar dades

            const result = await client.db(dbName).collection('prices').insertOne({
              data: data,
              avg: preuAVG,
              date: new Date(),
              link: link
            });

            console.log("> proces: Noves dades actualitzades")
            console.log("> proces: ID:", result.insertedId)
          }

        }
        
        // Close the database connection
        await client.close();
        
      free = true
    }
  }catch(err){
    if(err.name == "MongoServerSelectionError" && /connect ETIMEDOUT/.test(err.message) ){
      console.log("> Proces: Ha fallat la conexió a la db, reintentant...")
      free = true
      actualitzarDades()
    }else{
      console.log(err)
      console.log("> Proces: Ha fallat al connectar-se amb la db")
    }
  }
}

actualitzarDades()

// 15 3 * * * 3:15 AM

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule("10-20 3 * * *", async () => {

    try {
      console.log("\n\n#--------------------- AUTOMATIC PROCESS -------------------------------------------#")
      console.log("> Proces automatic: Hora actual")
      console.log(new Date())
      console.log(new Date().toLocaleString())

      actualitzarDades()


    } catch (error) {
      console.error(error);
      // free = true
    }
  });

  scheduledJobFunction.start();
}

