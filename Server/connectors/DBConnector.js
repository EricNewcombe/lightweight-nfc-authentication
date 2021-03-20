const sqlite3 = require('sqlite3');
const fs = require('fs');

class DBConnector
{
    constructor(db_file)
    {
        this.db_file = db_file;
    }

    // TODO: Add database operations for Tag objects below
    #connect()
    {
        this.conn = sqlite3.Database(this.db_file)
    }
    
    #disconnect()
    {
        this.conn.close();
    }

    run_script(location)
    {
        /*
        Runs a script from a file location
        */
        let script_file = fs.readFileSync(location, {flag:'r'});
        let script_contents = script_file.read();
        script_file.close();

        this.#connect();
        let c = this.conn.cursor();
        let res = c.executescript(script_contents);
        this.conn.commit();
        c.close();
        this.#disconnect();
        return res
    }

    run_sql(sql, columnset = [])
    {
        /*
        Runs arbitrary SQL and returns the result
        Sync causes this to be synchronized with replicas
        */
        this.#connect()
        let c = this.conn.cursor()
        c.execute(sql, columnset)
        let rows = c.fetchall()
        this.conn.commit()
        c.close()
        this.#disconnect() 

        return rows
    }

    run_sql_columnset(sql, columnset)
    {
        /*
        Runs sql with a columnset, good for paramaterized queries
        */
        this.#connect()
        let c = this.conn.cursor()
        c.execute(sql, columnset)
        this.conn.commit()
        let objid = c.lastrowid
        c.close()
        this.#disconnect()
        return objid
    }
};

module.exports = DBConnector;