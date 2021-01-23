//Access a varaible inside of proccess.env
//Chaching the value imporves perfomace
import * as dotenv from 'dotenv';

dotenv.config()

const cache: { [key:string]: string } = {};

const accessEnv = (key:string) => {
    if(!(key in process.env) || typeof process.env[key] === undefined) {
        throw new Error(`${key} not found in process.env`)
    }

    if(!(key in cache)){
        cache[key] = <string>process.env[key]
    }

    return cache[key]
}

export default accessEnv;