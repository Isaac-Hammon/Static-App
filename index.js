const qaItems = [
	{
		question: "How do I track my package?",
		answer:
			"You can easily track your package using our online tracking system. Simply enter your tracking number on our website get real-time updates on your delivery's status.",
	},
	{
		question: "What should I do if my package is damaged or lost?",
		answer:
			"If your package arrives damaged or is lost in transit, please contact us immediately. We will investigate the matter and arrange for a replacement or refund as per our policy.",
	},
	{
		question: "Can I change my delivery address after placing an order?",
		answer:
			"Yes, you can change your delivery address as long as the package has not been dispatched. Please contact our customer service team as soon as possible to make any changes.",
	},
	{
		question: "Are there any items that cannot be shipped?",
		answer:
			"Yes, there are certain restrictions on items that can be shipped due to safety and legal reasons. Please refer to our shipping policy or contact us for more information on prohibited items.",
	},
];

const accordionDiv = document.getElementById("accordion");

qaItems.forEach((qaItem) => {
	const questionText = qaItem.question;
	const answerText = qaItem.answer;

	const questionDiv = document.createElement("div");
	questionDiv.classList.add("accordion-question");
	questionDiv.textContent = questionText;

	const answerDiv = document.createElement("div");
	answerDiv.classList.add("accordion-answer");
	answerDiv.textContent = answerText;

	questionDiv.appendChild(answerDiv);

	questionDiv.addEventListener("click", () => {
		questionDiv.classList.toggle("active");
		answerDiv.classList.toggle("active");
	});

	accordionDiv.appendChild(questionDiv);
});


//Base Classes
class DatabaseObject {
	toString() {
		throw new Error("Not Implemented");
	}
}

//Product Class
class Product extends DatabaseObject {
constructor(name, inventory) {
	super();
	this.name = name; 
	this.inventory = inventory;
}


toString() {
	return `${this.name}: ${this.inventory} left in stock`;
}
}

//Delivery Class
class Delivery extends DatabaseObject {
constructor(params) {
super();
const { address, scheduleTime, product, quantity } = params;
this.address = address;
this.scheduleTime = scheduleTime;
this.product = product;
this.quantity = quantity;
}

toString() {
	return `Delivering${this.quantity} of ${this.product} to ${this.address} at ${this.scheduleTime}`;
}

static create(params){
// const { address, scheduleTime, product, quantity } = params
// return new Delivery(address, scheduleTime, product, quantity);
return new Delivery(params);
}

}


//Product DAO Class 
class ProductDao {
	static seeds = [
		{

		name: "Apples",
		inventory: 100,

		},

		{

		name: "Bananas",
		inventory: 80,

		},

		{

		name: "Peaches",
		inventory: 70,

		},
	];

getAll() {
	throw new Error("Not Implemented")
	}

getProductByName(name){
		throw new Error("Not Implemented")
	}

updateProduct() {
	throw new Error("Not Implemented")
}
}


//Session Storage Product DAO Class
class SessionStorageProductDao extends ProductDao{
constructor() {
super();
this.database = sessionStorage;
}

//This is Where I left off at 22 mins into the first video. 
getAll() {
	const productsAsJSON = this.database.getItem("products");
	const productsData = productsAsJSON ? JSON.parse(productsAsJSON) : ProductDao.seeds;
	return productsData.map((productData) => {
	const {name, inventory} = productData
	return new Product(name, inventory)
	});
	}


getProductByName(name){
const products = this.getAll();
return products.find(product => product.name == name);
	}
	

update(product) {
const existingProducts = this.getAll();
const indexToDelete = existingProducts.findIndex((productInList) => productInList.name == product.name); 
existingProducts.splice(indexToDelete, 1, product);
}
}

// Delivery DAO Class
class DeliveryDao {
	getAll() {
		throw new Error("Not Implemented");
	}
	create(delivery) {
		throw new Error("Not Implemented");
	}
}

// Session Storage Delivery DAO Class
class SessionStorageDeliveryDao extends DeliveryDao {
	constructor() {
		super();
		this.database = sessionStorage;
	}
	getAll() {
		const deliveriesInSessionStorage = this.database.getItem("deliveries");
		const deliveriesdata = deliveriesInSessionStorage ? JSON.parse(deliveriesAsJSON) : [];
		return deliveriesdata.map((deliveryData) => {
			return Delivery.create(deliveryData);
		});
	}
	create(delivery) {
		const deliveries = this.getAll();
		deliveries.push(delivery);
		this.database.setItem("deliveries", JSON.stringify(deliveries));
	}
}


// Session Storage Delivery DAO Class
class CreateDeliveryService {
	constructor(productDao, deliveryDao) {
		this.productDao = productDao;
		this.deliveryDao = deliveryDao;
	}

	createDelivery(productName, quantity, address, scheduleTime) {
		const product = this.productDao.getProductByName(productName);

		const newInventory = product.inventory - quantity;
		product.inventory = newInventory;

		const deliveryData = {
			product,
			quantity,
			address,
			scheduleTime
		};

		this.deliveryDao.create(deliveryData);
		this.productDao.update(product);
	}
}
//App Setup
const productDao = new SessionStorageProductDao();
const deliveryDao = new SessionStorageDeliveryDao();
const createDeliveryService = new CreateDeliveryService(productDao, deliveryDao);


const deliveryList = document.getElementById("delivery-list");
const deliveries = deliveryDao.getAll();
for(let i = 0; i < deliveries.length; i++) {
	const delivery = deliveries[i];
	const deliveryLi = document.createElement("li");
	deliveryLi.textContent = delivery.toString();
	deliveryList.appendChild(deliveryLi);
}

const productNameSelect = document.querySelector("#deliveries form select");
const products = productDao.getAll();
for (let i = 0; i < products.length; i++) {
	const product = products[i];
	const option = document.createElement("option");
	option.innerText = product.toString();
	option.setAttribute("value", product.name);
	productNameSelect.appendChild(option);

}
//






// class CookieStorageProductDAO extends ProductDao {
// 	constructor(){
// 		this.database = document.cookie;
// 	}
	
// getAll() {

// 	const productsAsJSON = this.database.getItem("products");
// 	return productsAsJSON ? JSON.parse(productsAsJSON) : [];

// 	}

// update(product) {
// const existingProducts = this.getAll();
// const indexToDelete = existingProducts.findIndex((productInList) => productInList.name == product.name); 
// existingProducts.splice(indexToDelete, 1, product);
// }
// 
