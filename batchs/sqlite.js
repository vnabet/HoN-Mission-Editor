(function () {
  "use strict";
  
  var sqlite3 = require('sqlite3').verbose();
  var Q = require('q');
  var fs = require('fs');
  var JSONLoader = require('../server/lib/JSONLoader');
  var logger = require('../server/lib/logger');
  var ProgressBar = require('../server/lib/progressBar');
  
  var file = "../server/db/HoN.sqlite";
  var exists = fs.existsSync(file);
  
  var dataLoader = new JSONLoader('./data.json');
  var data;
  
  var db;
  
  var queries = [
    'CREATE TABLE "game" ("gameid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "name" VARCHAR NOT NULL , "path" VARCHAR NOT NULL );',
    'CREATE TABLE "package" ("packageid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "gameid" INTEGER NOT NULL , "name" VARCHAR NOT NULL , "path" VARCHAR NOT NULL, FOREIGN KEY(gameid) REFERENCES game(gameid) );',
    'CREATE TABLE "tile" ("tileid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "packageid" INTEGER NOT NULL, "name" CHAR NOT NULL, FOREIGN KEY(packageid) REFERENCES package(packageid) );',
    'CREATE TABLE "tile_face" ("faceid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "tileid" INTEGER NOT NULL, "name" CHAR NOT NULL, FOREIGN KEY(tileid) REFERENCES tile(tileid) );' 
  ];
  
  
  //------------------------------------
  //Suppression de la base de données
  //------------------------------------
  (function () {
    
    logger.info('Suppression de la base de données.');
    
    var deferred = Q.defer();
    
    if(exists) {
      fs.unlink(file, function () {
        deferred.resolve();
      });
    } else {
      deferred.resolve();
    }
    return deferred.promise;
    
    
  }())
  //------------------------------------
  //Chargement du fichier de données
  //------------------------------------
  .then(function () {
    
    logger.info('Chargement du fichier de données.');
    
    var deferred = Q.defer();
    
    dataLoader.load().then(function (pData) {
      data = pData;
      //logger.info(data);
      deferred.resolve(data);
    }, function (error) {
      deferred.reject(error);
    });
    
    
    return deferred.promise; 
  })
  //------------------------------------
  //Ouverture de la base de données
  //------------------------------------
  .then(function () {
    logger.info('Création de la base de données.');
    
    var deferred = Q.defer();
    
    db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (error) {
      if(error) {
        deferred.reject(error);
      } else {
        deferred.resolve();      
      }
      
    });
    
    return deferred.promise;
  })
  //------------------------------------
  //Création des tables
  //------------------------------------
  .then(function () {
    
    logger.info('Création des tables...');
    
    var bar = new ProgressBar(queries.length);
    
    var deferred = Q.defer();
    var promises = [];
    
    db.serialize(function() {
      queries.forEach(function(query) {
        var _deferred = Q.defer();
        promises.push(_deferred.promise);
        db.run(query, function(error) {
          bar.tick();
          if(error) {
            _deferred.reject(error);
          } else {
            _deferred.resolve();  
          }
          
        });        
      });
    });
    Q.all(promises).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
    
    return deferred.promise;
    
  })
  //------------------------------------
  //Erreurs
  //------------------------------------
  .catch(function (error) {
    if(error) {
      logger.error(error);
    }
  })
  //------------------------------------
  //Fin du script
  //------------------------------------
  .done(function () {
    logger.info('~THE END~');
    if(db) {
      db.close();
    }
  });

  
}());

