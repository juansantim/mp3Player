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

module.exports = router;