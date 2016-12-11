// import necessary modules
const Sequelize = require ('sequelize')

// connect to database
let db = () => {
	return new Sequelize( process.env.POSTGRES_SPOTFB, process.env.POSTGRES_USER , process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
	})
}

// Define the models of the database
let User = ( db) => {
	return db.define ('user', {
		user_id: Sequelize.STRING,
		name: Sequelize.STRING,
		email: Sequelize.STRING,
		list_artists: Sequelize.ARRAY(Sequelize.STRING)
	})
}

module.exports = {
	DB: db,
	User: User
}