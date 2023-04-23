'use strict';
const CronJob = require("node-cron");
require('dotenv').config()
const uri = process.env.MONGODB_URI

const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient(uri);

// const MongoClient = require('mongodb').MongoClient;


// 15 3 * * * 3:15 AM

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule("* * * * *", async () => {
    // console.log(new Date());
    // Add your custom logic here

    try {
      // Connect to the MongoDB server
      await client.connect();
    
      const db = client.db();
      const dbName = db.databaseName;

      const last = await client.db(dbName).collection('price').find().sort({date:-1}).limit(1).toArray()

      let fer = false

      if (last.length > 0) {
        const data = last[0].date
        const avui = new Date()

        const same = avui.getFullYear() === data.getFullYear() &&
        avui.getMonth() === data.getMonth() &&
        avui.getDate() === data.getDate()

        fer = (same)? false : true

      } else {
        // console.log('No documents found.');
        fer = true
      }

      if(fer) {

        console.log("add price")
        console.log(new Date());


        
        // api preu hores
        const res = await fetch('https://api.preciodelaluz.org/v1/prices/all?zone=PCB')
        const data = await res.json()
        
        // mitjana
        const resAVG = await fetch('https://api.preciodelaluz.org/v1/prices/avg?zone=PCB')
        const dataAVG = await resAVG.json()

        // console.log("dades")
        // console.log(data)
        // console.log(dataAVG)
        // console.log(dataAVG.date)
        // agafar i tractar preu mitjana
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



        const result = await client.db(dbName).collection('price').insertOne({
          data: data,
          avg: preuAVG,
          date: new Date(),
          link: link
        });
        console.log(result.avg);
              


      }
      

  
      // Close the database connection
      await client.close();
    } catch (error) {
      console.error(error);
    }
  });

  scheduledJobFunction.start();
}