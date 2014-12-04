window.dao = {

	olddbRow : 0,
	newdbRow : 0,

	initialize : function(callback) {
		var self = this;
		this.db = window.openDatabase("inggapDB", "1.0", "Ingatlan adatbázis", 200000);

		this.db.transaction(function(tx) {
			tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='ingatlanok' ", this.txErrorHandler, function(tx, results) {
				if (results.rows.length == 1) {
					log('Már van ingatlanok tábla az SQLlite adatbázisban');
					console.log('Már van ingatlanok tábla az SQLlite adatbázisban');
				} else {
					log('Még nincs ingatlanok tábla SQLlite adatbázisban ezért csinálunk 1-t');
					console.log('Még nincs ingatlanok tábla SQLlite adatbázisban ezért csinálunk 1-t');
					self.createTable();
					self.createTableForSaveIng();
				}
			});
		});
	},

	ingatlanById : function(ingatlanID, callback) {
		this.db.transaction(function(tx) {
			var sql = "SELECT * FROM ingatlanok where id = " + ingatlanID;

			tx.executeSql(sql, this.txErrorHandler, function(tx, results) {
				var len = results.rows.length, ingatlan = [], i = 0;
				for (; i < len; i = i + 1) {
					ingatlan[i] = results.rows.item(i);
				}
				callback(ingatlan);
			});
		});

	},

	ingatlanokByUserID : function(userID, callback) {
		this.db.transaction(function(tx) {
			var sql = "SELECT * FROM ingatlanok where idTulaj = " + userID + " order by feltoltve desc";

			tx.executeSql(sql, this.txErrorHandler, function(tx, results) {
				var len = results.rows.length, ingatlan = [], i = 0;
				for (; i < len; i = i + 1) {
					ingatlan[i] = results.rows.item(i);
				}
				callback(ingatlan);
			});
		});

	},

	createTable : function() {
		this.db.transaction(function(tx) {
			var sql = "CREATE TABLE IF NOT EXISTS ingatlanok ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT," + " idTulaj int," + " kep VARCHAR(50)," + " megnevezes VARCHAR(50)," + "fekves VARCHAR(50), " + "tipus VARCHAR(50), " + "alapterulet int, " + "telekterulet int, " + "komfortfok VARCHAR(50), " + "viz int," + "gaz int," + "villany int," + "kozpontifutes int," + "pince int," + "csatorna int," + "garazs	int," + "kabeltv int," + "cim text," + "ar	int," + "feltoltve	VARCHAR(50)," + "aktiv	int )";
			tx.executeSql(sql);
		}, this.txErrorHandler, function() {
			log('Ingatlanok tábla sikeresen elkészitve !!');

		});
	},
	createTableForSaveIng : function() {
		this.db.transaction(function(tx) {
			var sql = "CREATE TABLE IF NOT EXISTS myIngs ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT," + " idTulaj int," + " kep VARCHAR(50)," + " megnevezes VARCHAR(50)," + "fekves VARCHAR(50), " + "tipus VARCHAR(50), " + "alapterulet int, " + "telekterulet int, " + "komfortfok VARCHAR(50), " + "viz int," + "gaz int," + "villany int," + "kozpontifutes int," + "pince int," + "csatorna int," + "garazs	int," + "kabeltv int," + "cim text," + "ar	int," + "aktiv	int )";
			tx.executeSql(sql);
		}, this.txErrorHandler, function() {
			log('Ingatlanok tábla sikeresen elkészitve !!');
		});
	},

	dropTable : function(callback) {
		this.db.transaction(function(tx) {
			tx.executeSql('DROP TABLE IF EXISTS ingatlanok');
			tx.executeSql('DROP TABLE IF EXISTS myIngs');
		}, this.txErrorHandler, function() {
			log('Ingatlanok táblát töröltük SQLlite adatbázisóból');
			callback();
		});
	},

	hirdeteseim : function(callback) {
		this.db.transaction(function(tx) {

			var sql = "SELECT  * FROM myIngs";
			tx.executeSql(sql, this.txErrorHandler, function(tx, results) {

				var len = results.rows.length, ingatlanok = [], i = 0;
				for (; i < len; i = i + 1) {
					ingatlanok[i] = results.rows.item(i);

				}

				callback(ingatlanok);
			});
		});
	},

	findAll : function(callback) {
		this.db.transaction(function(tx) {
			dao.olddbRow = 0;
			var sql = "SELECT  * FROM ingatlanok  order by feltoltve desc ";
			log('SQLlite lekérdezés : "SELECT * FROM ingatlanok "');
			tx.executeSql(sql, this.txErrorHandler, function(tx, results) {

				var len = results.rows.length, ingatlanok = [], i = 0;
				for (; i < len; i = i + 1) {
					dao.olddbRow++;
					ingatlanok[i] = results.rows.item(i);

				}
				log(len + ' ingatlan találat');
				console.log(dao.olddbRow);
				callback(ingatlanok);
			});
		});
	},

	getLastSync : function(callback) {
		this.db.transaction(function(tx) {
			var sql = "SELECT MAX(feltoltve) as lastSync FROM ingatlanok";
			tx.executeSql(sql, this.txErrorHandler, function(tx, results) {
				var lastSync = results.rows.item(0).lastSync;
				log('Utolsó SQLlite feltöltés ' + lastSync);
				callback(lastSync);
			});
		});
	},

	sync : function(callback) {

		var self = this;
		log('Szinkronizálás kezdése...');
		this.getLastSync(function(lastSync) {
			self.getChanges(self.syncURL, lastSync, function(changes) {
				if (changes.length > 0) {
					self.applyChanges(changes, callback);
				} else {
					alert('Nincs újabb ingatlan');

				}
			});
		});

	},

	getChanges : function(syncURL, modifiedSince, callback) {

		$.ajax({
			url : serverURL + "onlab1server/adatok.php",
			data : {
				modifiedSince : modifiedSince
			},
			dataType : "json",
			success : function(data) {
				console.log("A szerver visszaküldött " + data.length + " ingatlant, ami  " + modifiedSince + " után lett feltöltve");
				callback(data);
			},
			error : function(model, response) {
				alert(response.responseText);
			}
		});

	},

	insertIntoMyIngs : function(ingatlan,callback) {

		this.db.transaction(function(tx) {

			var sql = "INSERT OR REPLACE INTO myIngs (idTulaj,kep,megnevezes, fekves, tipus, alapterulet, telekterulet, komfortfok, viz,gaz ,villany,kozpontifutes,pince,csatorna,garazs,kabeltv,cim,ar,aktiv) " + "VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			var e = ingatlan;
			var params = [e.idTulaj, e.kep, e.megnevezes, e.telepules, e.tipus, e.alapterulet, e.telekterulet, e.komfortfok, e.viz, e.gaz, e.villany, e.kozpontifutes, e.pince, e.csatorna, e.garazs, e.kabeltv, e.cim, e.ar, e.aktiv];
			tx.executeSql(sql, params);

		}, this.txErrorHandler, function(tx) {
			alert('Az ingatlant elmentettük');
			callback();
		});
	},

	updateMyIng : function(id) {
		this.db.transaction(function(tx) {

			var sql = "UPDATE myIngs set aktiv=1 where id="+id;
			tx.executeSql(sql);

		}, this.txErrorHandler, function(tx) {
			alert('Az ingatlan feltöltve');
		});

	},

	getMyIngById : function(id, callback) {
		this.db.transaction(function(tx) {
			var sql = "SELECT * FROM myIngs where id = " + id;

			tx.executeSql(sql, this.txErrorHandler, function(tx, results) {
				var len = results.rows.length, ingatlan = [], i = 0;
				for (; i < len; i = i + 1) {
					ingatlan[i] = results.rows.item(i);
				}
				callback(ingatlan);
			});
		});

	},

	applyChanges : function(ingatlanok, callback) {
		this.db.transaction(function(tx) {
			var l = ingatlanok.length;

			var sql = "INSERT OR REPLACE INTO ingatlanok (id,idTulaj,kep,megnevezes, fekves, tipus, alapterulet, telekterulet, komfortfok, viz,gaz ,villany,kozpontifutes,pince,csatorna,garazs,kabeltv,cim,ar,feltoltve,aktiv) " + "VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			log('Beszúrás a locális adatbázisba:');
			var e;
			for (var i = 0; i < l; i++) {
				dao.olddbRow++;
				e = ingatlanok[i];
				downloadImage(serverURL + 'onlab1server/kepfeltoltes.php?image=' + e.kep, e.kep);
				var params = [e.id, e.idTulaj, e.kep, e.megnevezes, e.fekves, e.tipus, e.alapterulet, e.telekterulet, e.komfortfok, e.viz, e.gaz, e.villany, e.kozpontifutes, e.pince, e.csatorna, e.garazs, e.kabeltv, e.cim, e.ar, e.feltoltve, e.aktiv];
				tx.executeSql(sql, params);

			}
			log('Szinkronizálás kész (' + l + ' elem szinkronizálva)');

			if (dao.olddbRow > 10) {
				dao.sqlSortorles(dao.olddbRow - 10);
			}

		}, this.txErrorHandler, function(tx) {
			callback();
		});
	},
	txErrorHandler : function(tx) {
		alert(tx.message);
	},
	sqlSortorles : function(l) {
		this.db.transaction(function(tx) {

			var sql = "DELETE FROM `ingatlanok` WHERE id IN (select id  FROM `ingatlanok`  ORDER BY `feltoltve`  LIMIT " + l + ")";
			tx.executeSql(sql, this.txErrorHandler, function(tx, results) {

				console.log(l + ' régi ingatlan törlése az offline adatbázisból:');

			});
		}, this.txErrorHandler, function(tx) {

		});
	}
};

dao.initialize(function() {
	console.log('helyi adatbázis betöltve');
});

function log(msg) {
	$('#log').val($('#log').val() + msg + '\n');
}
