const express = require('express')
var moment = require('moment'); // require

var archiver = require('archiver');

const { Op } = require('sequelize');

const model = require('./Model/model');

var router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World')
})

const fs = require('fs');
const { readdirSync } = fs;

const path = require('path');

router.get('/updateDb', (req, res) => {


    model.Audios.destroy({
        where: {},
        truncate: true
    })

    //joining path of directory 
    const baseDirectory = path.join(__dirname, '../audio');

    let dirSeparator = process.platform === "win32" ? '\\' : '/';

    const getDirectories = source => readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => source + dirSeparator + dirent.name)

    const LoadFiles = function (dir) {

        fs.readdir(dir, { withFileTypes: true }, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            //listing all files using forEach
            files.forEach(function (file) {
                if (file.isFile() === true) {
                    var array = file.name.split('-');

                    let origen = array[2];
                    let destino = array[1];

                    let fecha = moment(array[3]).toDate();

                    model.Audios.create({
                        FilePath: `${dir}${dirSeparator}${file.name}`,
                        FileName: file.name,
                        Directory: dir,
                        Origen: origen,
                        Destino: destino,
                        Fecha: fecha
                    }).then(data => {
                        console.log(`File indexed ${data.FileName}`);
                    });
                }

            });

        });

        getDirectories(dir).forEach(subDirs => {
            LoadFiles(subDirs)
        })


    }

    LoadFiles(baseDirectory);
    res.send('UpToDate');

})

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


        pagination.totalPages = Math.ceil(pagination.totalItems / pagination.pageSize) - 1;

        model.Audios.findAndCountAll(
            {
                where: where,
                attributes: ['id', 'FileName', 'Origen', 'Destino', 'Fecha', 'FilePath'],
                limit: pagination.pageSize,
                offset: (pagination.currentPage - 1) * pagination.pageSize
            }).then((data) => {
                let result = {
                    totalItems: data.count,
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

router.post('/downloadAll', (req, res) => {

    let { filter, pagination } = req.body;

    let where = {};

    if (filter) {
        if (filter.filtrarFechas) {
            where.Fecha = { [Op.between]: [filter.fechaDesde, filter.fechaHasta] }
        }

        if (filter.filtrarOrigen) {
            where.Origen = { [Op.eq]: filter.origen }
        }

        if (filter.filtrarDestino) {
            where.Destino = { [Op.eq]: filter.destino }
        }
    }

    model.Audios.count({ where }).then(data => {

        model.Audios.findAndCountAll(
            {
                where: where,
                attributes: ['id', 'FileName', 'FilePath'],
            }).then((data) => {


                const fileName = `./download/${uuidv4()}.zip`;
                var output = fs.createWriteStream(fileName);

                var archive = archiver('zip', {
                    gzip: true,
                    zlib: { level: 9 } // Sets the compression level.
                });

                archive.on('error', function (err) {
                    res.send(500);
                });

                // pipe archive data to the output file
                archive.pipe(output);

                // append files

                data.rows.forEach(file => {
                    archive.file(file.FilePath, { name: file.FileName });
                })

                archive.finalize();

                output.on('close', ()  => {
                    const downloadPath = path.join(__dirname, '.' + fileName);

                    fs.readFile(downloadPath, 'binary', (err, file) => {
                        if (err) {
                            if (err.errno == -4058) {
                                res.send(404)
                            }
                            else {
                                res.send(500)
                            }

                        }
                        else {
                            res.setHeader('Content-Length', file.length);
                            res.setHeader('Content-disposition', `attachment; filename=download.zip`);
                            res.write(file, 'binary');
                            res.end();
                        }
                    });
                })
            })

    });


})


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


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

router.get('/download', (req, res) => {
    const id = req.query.id;

    model.Audios.findOne({
        where: {
            id: req.query.id
        }
    }).then(audio => {


        var file = fs.readFile(audio.FilePath, 'binary', (err, data) => {
            if (err) {
                if (err.errno == -4058) {
                    res.send(404)
                }
                else {
                    res.send(500)
                }

            }
            else {
                res.setHeader('Content-Length', data.length);
                res.setHeader('Content-disposition', `attachment; filename=${audio.FileName}`);
                res.write(data, 'binary');
                res.end();
            }
        });


    })

})


router.post('/download', (req, res) => {

    let fileName = req.query.filaName;

    const downloadPath = path.join(__dirname, '.' + fileName);

    fs.readFile(downloadPath, 'binary', (err, file) => {
        if (err) {
            if (err.errno == -4058) {
                res.send(404)
            }
            else {
                res.send(500)
            }
        }
        else {
            res.setHeader('Content-Length', file.length);
            res.setHeader('Content-disposition', `attachment; filename=download.zip`);
            res.write(file, 'binary');
            res.end();
        }
    });

})



module.exports = router;