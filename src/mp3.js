const express = require('express')
var moment = require('moment'); // require

const model = require('./Model/model');

var router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World')
})

router.get('/updateDb', (req, res) => {

    const path = require('path');
    const fs = require('fs');

    //joining path of directory 
    const directoryPath = path.join(__dirname, '../audio');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file) {

            /*
             FilePath: DataTypes.STRING(255),    
            FileName: DataTypes.STRING(255), 
            Directory: DataTypes.STRING(255),       
            Origen: DataTypes.STRING,
            Destino: DataTypes.STRING,
            Fecha: DataTypes.DATE,  
            */

            //[COLA,EXTENSION,RINGROUP]-DESTINO-ORIGEN-FECHA-HORA-[ID-DE-ASTERISK].WAV
            //exten-254-8095801171-20190228-092104-1551360039.188501.WAV
            //q-4000-8092212448-20190228-160309-1551384167.199115.WAV

            var array = file.split('-');
            
            let origen = array[2];
            let destino =array[1];

            let fecha = moment(array[3]).toDate();

            let audio = model.Audios.create({
                FilePath: `${directoryPath}\\${file}`,
                FileName: file,
                Directory: directoryPath,
                Origen: origen,
                Destino: destino,
                Fecha: fecha
            })

            console.log(file);
        });

        res.send('UpToDate')
    });

})

/*
   "id":1,
      "FilePath":"C:\\Workspace\\mp3Player\\audio\\exten-254-8095801171-20190228-092104-1551360039.188501.WAV",
      "FileName":"exten-254-8095801171-20190228-092104-1551360039.188501.WAV",
      "Directory":"C:\\Workspace\\mp3Player\\audio",
      "Origen":"8095801171",
      "Destino":"254",
      "Fecha":"2019-02-28T04:00:00.000Z",
      "createdAt":"2020-08-08T20:23:32.944Z",
      "updatedAt":"2020-08-08T20:23:32.944Z"
*/
router.get('/getall', (req, res) => {
    audios = model.Audios.findAll({attributes:['id', 'FileName', 'Origen', 'Destino', 'Fecha']}).then(data => {
        res.send(data);
    })
    
})

router.get('/stream', (req, res) => {

    let file = model.Audios.findOne({
        where:{
            id:req.query.id
        }
    }).then(data => {
        console.log(data)
        res.send('Ok')
    })

    // const file = __dirname + '/mp3/trololol.mp3';
    // const stat = fs.statSync(file);
    // const total = stat.size;
    // if (req.headers.range) {

    // }
  
    // fs.exists(file, (exists) => {
    //     if (exists) {
    //         const range = req.headers.range;
    //         const parts = range.replace(/bytes=/, '').split('-');
    //         const partialStart = parts[0];
    //         const partialEnd = parts[1];

    //         const start = parseInt(partialStart, 10);
    //         const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
    //         const chunksize = (end - start) + 1;
    //         const rstream = fs.createReadStream(file, {start: start, end: end});

    //         res.writeHead(206, {
    //             'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
    //             'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
    //             'Content-Type': 'audio/mpeg'
    //         });
    //         rstream.pipe(res);

    //     } else {
    //         res.send('Error - 404');
    //         res.end();
    //         // res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
    //         // fs.createReadStream(path).pipe(res);
    //     }
    // });
});

module.exports = router;