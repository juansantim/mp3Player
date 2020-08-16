
const { Sequelize, DataTypes  } = require('sequelize');

// Option 2: Passing parameters separately (sqlite)
const connection = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  //logging: console.log,
  logging: false,
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
});

model.Usuarios = connection.define('Users', {
  UserName: DataTypes.STRING(80),
  Password: DataTypes.STRING(32),
  Email: DataTypes.STRING(255),
  FirstName: DataTypes.STRING(155),
  LastName: DataTypes.STRING(155)
});

model.Usuarios.count().then(count => {
  if(count == 0){
    model.Usuarios.create({
      UserName: 'jsanti',
      Password: '202cb962ac59075b964b07152d234b70',
      Email: 'juanv.santim@gmail.com',
      FirstName: 'Juan',
      LastName: 'Santi'
    })
  }
})

connection.sync();

module.exports = model;