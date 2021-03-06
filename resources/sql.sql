CREATE TABLE "game" ("gameid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "name" VARCHAR NOT NULL , "path" VARCHAR NOT NULL );

CREATE TABLE "package" ("packageid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "gameid" INTEGER NOT NULL , "name" VARCHAR NOT NULL , "path" VARCHAR NOT NULL, FOREIGN KEY(gameid) REFERENCES game(gameid) );

CREATE TABLE "tile" ("tileid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "packageid" INTEGER NOT NULL, "name" CHAR NOT NULL, FOREIGN KEY(packageid) REFERENCES package(packageid) );

CREATE TABLE "tile_face" ("faceid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "tileid" INTEGER NOT NULL, "name" CHAR NOT NULL, FOREIGN KEY(tileid) REFERENCES tile(tileid) );