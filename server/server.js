var express = require('express');
var bodyParser = require('body-parser')
var app = express();

var nextCustomerId=1;
class Customer {
  constructor(name, city) {
    if(name!="") {
      this.id = nextCustomerId++;
      this.name=name;
      this.city=city;
    }
  }
}

//This resource makes it possible to download and start the React client
app.use(express.static(__dirname + "/../client"));

//Make app automatically parse json content
app.use(bodyParser.json());

var customers=[]; // fungerer som lagring
customers.push(new Customer("Ola", "Trondheim"));
customers.push(new Customer("Kari", "Oslo"));
customers.push(new Customer("Per", "Tromsø"));


//Get all customers
app.get('/customers', (request, response) => {
  //sending for instance: [{"id":1,"name":"Ola"}, {"id":2,"name":"Kari"}, {"id":3,"name":"Per"}]
  var customer_id_and_names=[]
  for(var c=0;c<customers.length;c++) {
    customer_id_and_names.push({id: customers[c].id, name: customers[c].name});
  }
  response.send(customer_id_and_names);
});

app.delete('/customers', (request,response)=>{
  console.log("About to delete.",request.body.id);
  for(var c=0;c<customers.length;c++) {
    if(customers[c].id==request.body.id) {
      customers.splice(c,1);
      console.log(customers);
      response.send({status:200, msg:"GJ"});
      return;
    }
  }
})

//Get one customer given its id
app.get('/customers/:id', (request, response) => {
  console.log(request.params.id);
  for(var c=0;c<customers.length;c++) {
    if(customers[c].id==request.params.id) {
      response.send(customers[c]);
      return;
    }
  }
  //Respond with not found status code
  response.sendStatus(404);
});

app.put('/customer', (req,res) =>{
  console.log(req.path,req.body);
  for(var c=0;c<customers.length;c++){
    if(customers[c].id == req.body.id){
      customers[c].name = req.body.name;
      customers[c].city = req.body.city;
      res.send(true);
    }
  }
})

//Add new customer if name and city contain data
app.post('/customers', (request, response) => {
  console.log(request.body);
  if(request.body.name && request.body.city) {
    customers.push(new Customer(request.body.name, request.body.city));
    response.send(customers[customers.length-1].id.toString());
    return;
  }
  //Respond with bad request status code
  response.sendStatus(400);
});

//Start the web server
//Open for instance http://localhost:3000 in a web browser
var server = app.listen(3000, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
