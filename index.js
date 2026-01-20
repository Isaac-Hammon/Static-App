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
	return `Delivering ${this.quantity} ${this.product.name} to ${this.address} on ${this.scheduleTime}`;
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

// getProductByName(name){
// 		throw new Error("Not Implemented")
// 	}

getProductByName(name){
const products = this.getAll();
return products.find(product => product.name == name);
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

getAll() {
	const productsAsJSON = this.database.getItem("products");
	const productsData = productsAsJSON ? JSON.parse(productsAsJSON) : ProductDao.seeds;
	return productsData.map((productData) => {
	const {name, inventory} = productData
	return new Product(name, inventory)
	});
	}


// getProductByName(name){
// const products = this.getAll();
// return products.find(product => product.name == name);
// 	}
	

update(product) {
const existingProducts = this.getAll();
const indexToDelete = existingProducts.findIndex((productInList) => productInList.name == product.name); 
existingProducts.splice(indexToDelete, 1, product);
this.database.setItem("products", JSON.stringify(existingProducts));
}
}



class CookieStorageProductDao extends ProductDao {
	constructor(){
		super();
		this.database = document.cookie;
	}
	
getAll() {
	const cookieValue = document.cookie
	.split("; ")
	.find((row) => row.startsWith("products"))
	?.split("=")[1];

	const productsData = cookieValue ? JSON.parse(cookieValue) : ProductDao.seeds;
	return productsData.map(
		(productData) => new Product(productData.name, productData.inventory),
	);

	}

update(product) {
const existingProducts = this.getAll();
const indexToDelete = existingProducts.findIndex(
	(productInList) => productInList.name == product.name,); 
existingProducts.splice(indexToDelete, 1, product);
document.cookie = `products=${JSON.stringify(existingProducts)}; max-age=30`;
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
		const deliveriesdata = deliveriesInSessionStorage ? JSON.parse(deliveriesInSessionStorage) : [];
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

class CookieStorageDeliveryDao extends DeliveryDao {
	getAll() {
	const cookieValue = document.cookie
	.split("; ")
	.find((row) => row.startsWith("deliveries"))
	?.split("=")[1];

	const deliveriesData = cookieValue ? JSON.parse(cookieValue) : [];
	return deliveriesData.map(
		(deliveryData) => new Delivery(deliveryData));

	}

	create(delivery) {
	const existingDeliveries = this.getAll();
    existingDeliveries.push(delivery);
    document.cookie = `deliveries=${JSON.stringify(existingDeliveries)}; max-age=30`;
}
}

// Session Storage Delivery DAO Class
class CreateDeliveryService {
	constructor(ProductDao, DeliveryDao) {
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
			scheduleTime,
		};

		this.deliveryDao.create(deliveryData);
		this.productDao.update(product);
	}
}

//App Setup
// const productDao = new SessionStorageProductDao();
const productDao = new CookieStorageProductDao();
const deliveryDao = new CookieStorageDeliveryDao();
// const deliveryDao = new SessionStorageDeliveryDao();
const createDeliveryService = new CreateDeliveryService(productDao, deliveryDao);


const deliveryList = document.getElementById("deliveries-list");
const deliveries = deliveryDao.getAll();
for(let i = 0; i < deliveries.length; i++) {
	const delivery = deliveries[i];
	const deliveryLi = document.createElement("li");
	deliveryLi.textContent = delivery.toString();
	deliveryList.appendChild(deliveryLi);
}

const productNameSelect = document.querySelector("#deliveries form select");
const quantityInput = document.querySelector("#deliveries form input[name='quantity']");

const products = productDao.getAll();
console.log("products");
console.log(products[0].toString());
for (let i = 0; i < products.length; i++) {
	const product = products[i];
	const option = document.createElement("option");
	option.innerText = product.toString();
	option.setAttribute("value", product.name);
const existingInventory = product.inventory;
if (i == 0) {
	console.log("product");
	console.log(product);
	quantityInput.setAttribute("max", existingInventory);
	console.log(`option.getAttribute("max")`);
	console.log(option.getAttribute("max"));
}
if (existingInventory > 0) {
	productNameSelect.appendChild(option);
}
}

function handleChangeToProductName(event) {
const productName = event.target.value;
const selectedProduct = productDao.getProductByName(productName);
const existingInventory = selectedProduct.inventory;
quantityInput.setAttribute("max", existingInventory);

}
productNameSelect.addEventListener("change", handleChangeToProductName)



const createDeliveryForm = document.querySelector("#deliveries form");
createDeliveryForm.addEventListener("submit", (event) => {
		// event.preventDefault();
const formData = new FormData(event.target);
const address = formData.get("address");
const scheduleTime = formData.get("scheduledTime");
const productName = formData.get("productName");
const quantity = formData.get("quantity");

createDeliveryService.createDelivery(productName, quantity, address, scheduleTime);

});







