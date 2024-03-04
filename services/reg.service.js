const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");

const broker = new ServiceBroker();
const reg = new Promise(function(res, rej){
// Создаем сервис взаимодействия с Sequlize
	broker.createService({
		name: "users",
		mixins: [DbService],
		adapter: new SqlAdapter("postgres://user:pass@example.com:5432/dbname"),
		model: {
			name: "registration",
			define: {
				name: Sequelize.STRING,
				surname: Sequelize.STRING,
				patronymic: Sequelize.STRING/NULL,
				email_address: Sequelize.STRING,
				phone_number: Sequelize.STRING,
				password: Sequelize.STRING,
				confirm: Sequelize.BOOLEAN
			},
			options: {
				
			}
		},
	});	
	if(data.query != [] && data.query != indefined){
		broker.start()
		// Create a new user
		.then(() => broker.call("registration.create", {
			name: data.query.name,
			surname: data.query.surname,
			patronymic: data.query.patronymic,
			email_address: data.query.email_address,
			phone_number: data.query.phone_number,
			password: data.query.password,
			confirm: data.query.confirm
		})).resolve('reg', data.query)
		// Get all users
		.then(() => broker.call("users.find").then());
	} else reject(err)
});	

module.exports(reg(data.query))