
const { Sequelize, DataTypes  } = require('sequelize');

// Option 2: Passing parameters separately (sqlite)
const connection = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: console.log,
  operatorsAliases: false,
  sync: true
});

 let model = {};

 model.Audios = connection.define('Audios', {
    FilePath: DataTypes.STRING(255),    
    FileName: DataTypes.STRING(255), 
    Directory: DataTypes.STRING(255),       
    Origen: DataTypes.STRING,
    Destino: DataTypes.STRING,
    Fecha: DataTypes.DATE,    
})

connection.sync({
    force:true
})

module.exports = model;