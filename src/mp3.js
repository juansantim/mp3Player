const express = require('express')
var moment = require('moment'); // require

const { Op } = require('sequelize');

const model = require('./Model/model');

var router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World')
})

const fs = require('fs');
const path = require('path');

router.get('/updateDb', (req, res) => {


    model.Audios.destroy({
        where: {},
        truncate: true
    })

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
            let destino = array[1];

            let fecha = moment(array[3]).toDate();

            let audio = model.Audios.create({
                FilePath: `${directoryPath}\\${file}`,
                FileName: file,
                Directory: directoryPath,
                Origen: origen,
                Destino: destino,
                Fecha: fecha
            })
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

// export class DataFilter{
//     filtrarFechas: boolean;
//     filtrarOrigen: boolean;
//     filtrarDestino: boolean;

//     fechaDesde: Date;
//     fechaHasta: Date;

//     origen: string;
//     destino: string;
// }

router.post('/getall', (req, res) => {

    let { filter, pagination } = req.body;

    let where = {};

    if (filter.filtrarFechas) {
        where.Fecha = { [Op.between]: [filter.fechaDesde, filter.fechaHasta] }
    }

    if (filter.filtrarOrigen) {
        where.Origen = { [Op.eq]: filter.origen }
    }

    if (filter.filtrarDestino) {
        where.Destino = { [Op.eq]: filter.destino }
    }

    model.Audios.count({ where }).then(data => {
        pagination.totalItems = data;


        pagination.totalPages = Math.ceil(pagination.totalItems / pagination.pageSize) -1 ;

        model.Audios.findAndCountAll(
            {
                where: where,
                attributes: ['id', 'FileName', 'Origen', 'Destino', 'Fecha'],
                limit: pagination.pageSize,
                offset: (pagination.currentPage - 1) * pagination.pageSize
            }).then((data) => {
                let result = {
                    totalItems: data.length,
                    data: data.rows,
                    totalPages: pagination.totalPages,
                    currentPage: pagination.currentPage,
                    pageSize: pagination.pageSize
                };

                res.send(result);

                console.log('THE COUNT IS =====>', data.count);
            })

    });


})

router.get('/getall', (req, res) => {
    console.log(req.body);
    audios = model.Audios.findAll({ attributes: ['id', 'FileName', 'Origen', 'Destino', 'Fecha'] }).then(data => {

        let result = {
            totalItems: data.length,
            data,
            totalPages: 1,
            currentPage: 1
        };

        res.send(result);
    })

})

router.get('/play', (req, res) => {
    const id = req.query.id;

    model.Audios.findOne({
        where: {
            id: req.query.id
        }
    }).then(data => {

        ms = require('mediaserver');

        ms.pipe(req, res, `audio/${data.FileName}`)
    })

})

router.get('list', (req, res) => {

});

router.get('/download', (req, res) => {
    const id = req.query.id;

    model.Audios.findOne({
        where: {
            id: req.query.id
        }
    }).then(audio => {


        var file = fs.readFileSync(audio.FilePath, 'binary');

        res.setHeader('Content-Length', file.length);
        res.setHeader('Content-disposition', `attachment; filename=${audio.FileName}`);
        res.write(file, 'binary');
        res.end();

    })

})



module.exports = router;