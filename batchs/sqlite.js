(function () {
  "use strict";
  
  var sqlite3 = require('sqlite3').verbose();
  var Q = require('q');
  var fs = require('fs');
  var JSONLoader = require('../server/lib/JSONLoader');
  var logger = require('../server/lib/logger');
  var progressBar = require('../server/lib/progressBar');
  
  var file = "../server/db/HoN.db";
  var exists = fs.existsSync(file);
  
  var dataLoader = new JSONLoader('./data.json');
  var data;
  
  
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
      logger.info(data);
      deferred.resolve(data);
    }, function (error) {
      deferred.reject(error);
    });
    
    
    return deferred.promise; 
  })
  //------------------------------------
  //Erreurs
  //------------------------------------
  .catch(function(error) {
    if(error) {
      logger.error(error);
    }
  })
  //------------------------------------
  //Fin du script
  //------------------------------------
  .done(function() {
    logger.info('~THE END~');
    //if(db) db.close();
  });
  
  
  
 /* var db = new sqlite3.Database(file);

  db.serialize(function() {

  });

  db.close();*/
  
}());

