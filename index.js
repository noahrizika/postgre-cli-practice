#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import pkg from 'pg';
import readline from 'readline';

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

const { Client } = pkg;
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'dvdrental',
  user: 'postgres',
  password: 'PASSWORD', // type password here
});

async function welcome() {
    const welcomeTitle = chalkAnimation.rainbow(
        'Pick a movie. Any Movie! \n'
    );
    // await sleep();
    welcomeTitle.stop();
};

async function searchMovies() {
    const title = rl.question('What is your favorite food? ');
    console.log(`You wanna search for ${title}?`);
    console.log(`...yeah this part is a work in progess`);
    await sleep();
    mainOptions();
};

async function createDatabase(table_name)
{
    await client.query('DROP TABLE IF EXISTS ${table_name};');
    await client.query(`
        CREATE TABLE ${table_name}(
        movie_id SERIAL PRIMARY KEY,
        title VARCHAR (50) NOT NULL,
        actors VARCHAR (50) NOT NULL,
        directors VARCHAR (50) NOT NULL,
        release_date DATE NOT NULL,
      );`);
}

async function extrasMenu() {
    createDatabase('favorites');

    const answers = await inquirer.prompt({
        name: 'options_main',
        type: 'list',
        message: 'Add movies to favorites table',
        choices: [
            'See favorites',
            'Add Inception to favorites',
            'Add Kung Fu Panda to favorites',
            'Add Point Break to favorites',
            'Quit',
        ],
    });
    if (answers.choices == 'See favorites')
    {
        return makeQuery('SELECT * FROM favorites');
    }
    if (answers.choices == 'Add Inception to favorites')
    {
        return makeQuery(
            `INSERT INTO favorites(title, actors, directors, release_date)
             VALUES(Inception, Leonardo DiCaprio, Christopher Nolan, 2010-07-13));`
        );
    }
    else
    {
        await client.end();
        process.exit(0);
    }
}

async function mainOptions() {
    const answers = await inquirer.prompt({
        name: 'options_main',
        type: 'list',
        message: 'Search movies',
        choices: [
            'By Title',
            'By Genre',
            'By Actor',
            'Search Movies',
            'Extras',
            'Quit',
        ],
    });

    if (answers.options_main == 'By Title')
    {
        return makeQuery('SELECT title FROM film ORDER BY title asc');
    }
    else if (answers.options_main == 'By Genre')
    {
        return makeQuery('SELECT name FROM category');
        // only prints a list of categories...now i wanna search the categories
    }
    else if (answers.options_main == 'By Actor')
    {
        return makeQuery("SELECT first_name || ' ' || last_name AS name FROM actor ORDER BY last_name asc, first_name asc");
        // only prints a list of actors...now I wanna find the movies that a selected actor is in
    }
    else if (answers.options_main == 'Search Movies')
    {
        searchMovies();
    }
    else if (answers.options_main == "Extras")
    {
        extrasMenu();
    }
    else
    {
        await client.end();
        process.exit(0);
    }
};

async function makeQuery(request) {
    const data = await client.query(request);
    console.log(data.rows);
    mainOptions();
};

await welcome();
await client.connect().catch(err => console.error('Error connecting to server', err.stack));
await mainOptions();