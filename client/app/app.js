// @flow

import React from 'react';
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

class Menu extends React.Component {
  render() {
    return <div>
    <ul id = "navbar">
      <li><a href="/#/">Customers</a></li>
      <li><a href ="/about">About</a></li>
    </ul>
    </div>;
  }
}

class CustomerService {
  static instance=null;
  lastId=0;
  customers=[];

  // Return singleton
  static get() {
    if(!this.instance)
      this.instance=new CustomerService();
    return this.instance;
  }

  constructor() {
    this.customers.push({id: ++this.lastId, name: "Ola", city: "Trondheim"});
    this.customers.push({id: ++this.lastId, name: "Kari", city: "Oslo"});
    this.customers.push({id: ++this.lastId, name: "Per", city: "Tromsø"});
  }

  // Returns a manually created promise since we are later going to use fetch(),
  // which also returns a promise, to perform an http request.
  getCustomers() {
    return new Promise((resolve, reject)=>{
      var customer_id_and_names=[];
      for(var c=0;c<this.customers.length;c++) {
        customer_id_and_names.push({id: this.customers[c].id, name: this.customers[c].name});
      }
      resolve(customer_id_and_names);
    });
  }

  deleteCustomer(customerId){
    console.log("Trying to delete ", customerId);
      return new Promise((resolve, reject) =>{
        for (var c=0;c<this.customers.length;c++){
            if(this.customers[c].id == customerId){
                resolve(this.customers[c].id);
                this.customers.splice(c,1);
                return;
            }
        }
        reject("Customer not found");
    });
  }
  getCustomer(customerId) {
    return new Promise((resolve, reject)=>{
      for(var c=0;c<this.customers.length;c++) {
        if(this.customers[c].id==customerId) {
          resolve(this.customers[c]);
          return;
        }
      }
      reject("Customer not found");
    });
  }

  editCustomer (customerId, new_name, new_city){
    return new Promise((resolve, reject) =>{
      for (var c = 0; c<this.customers.length;c++){
        if(this.customers[c].id == customerId){
          this.customers[c].name = new_name;
          this.customers[c].city = new_city;
          console.log(this.customers[c]);
          resolve(this.customers[c].id);
          return;
        }
      }
    })
  }
  addCustomer(name, city) {
    return new Promise((resolve, reject)=>{
      if(name && city) {
        this.customers.push({id: ++this.lastId, name: name, city: city});
        resolve(this.lastId);
        return;
      }
      reject("name or city empty");
    });
  }
}

class CustomerListComponent extends React.Component {
  state={status: "", customers: [], newCustomerName: "", newCustomerCity: "", deleteCustomerId:""}

  constructor() {
    super();

    CustomerService.get().getCustomers().then((result)=>{
      this.setState({status: "successfully loaded customer list", customers: result});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }

  // Event methods, which are called in render(), are declared as properties:
  onNewCustomerFormChanged = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  // Event methods, which are called in render(), are declared as properties:
  onNewCustomer = (event) => {
    event.preventDefault();
    var name=this.state.newCustomerName;
    var city=this.state.newCustomerCity;
    CustomerService.get().addCustomer(name, city).then((result)=>{
      this.state.customers.push({id: result, name: name, city});
      console.log(name,city,"res ",result);
      this.setState({status: "successfully added new customer", customers: this.state.customers, newCustomerName: "", newCustomerCity: ""});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  onDeleteCustomer = (event) =>{
    event.preventDefault();
    var id = this.state.deleteCustomerId;
    console.log("state ",this.state);
    CustomerService.get().deleteCustomer(id).then((result)=> {
      this.state.customers.splice(result-1,1);
      this.setState({status: "successfully deleted user " + result});
      console.log("OnDel",result);
    }).catch((reason) =>{
      this.setState({status:"error: " + reason});
      console.log(reason);
      console.log("Fikk ikke til å slette.")
    })
  }
  onDeleteCustomerFormChanged = (event) =>{
    //console.log("Hest");
    this.setState({[event.target.name]: event.target.value});
  }


  render() {
    var listItems = this.state.customers.map((customer) =>
      <li key={customer.id}><a href={"/#/customer/"+customer.id}>{customer.name}</a></li>
    );
    return <div>status: {this.state.status}<br/>
        <ul>{listItems}</ul>
        <form onSubmit={this.onNewCustomer} onChange={this.onNewCustomerFormChanged}>
          <label>Name:<input type="text" name="newCustomerName" value={this.state.newCustomerName} /></label>
          <label>City:<input type="text" name="newCustomerCity" value={this.state.newCustomerCity} /></label>
          <input type="submit" value="New Customer"/>
        </form>
        <form onSubmit = {this.onDeleteCustomer} onChange={this.onDeleteCustomerFormChanged}>
          <label>id:<input type="number" name="deleteCustomerId" value={this.state.deleteCustomerId} /></label>
          <input type ="submit" value="Delete customer"/>
        </form>
      </div>
  }
}

class CustomerDetailsComponent extends React.Component {
  state={status: "", customer: {}, newName:"", newCity:""}

  constructor(props) {
    super(props);

    CustomerService.get().getCustomer(props.params.customerId).then((result)=>{
      this.setState({status: "successfully loaded customer details", customer: result});
      console.log(this.state);
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  onEditCustomer = (event) => {
    console.log("HELLO");
    event.preventDefault();
    console.log(this.state);
    CustomerService.get().editCustomer(this.state.customer.id,this.state.newName,this.state.newCity).then((result) =>{
      this.setState({status:"Customer changed."});
      this.state.newName = "";
      this.state.newCity = "";
      console.log(this.state.customer);
    }).catch((reason)=>{
      this.setState({satus:"error: " + reason});
      console.log("");
    })
  }
  onEditCustomerFormChanged = (event) =>{
    //console.log("Kjører form change.");
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    return <div>status: {this.state.status}<br/>
    <ul>
      <li>{this.state.customer.name}</li>
      <li>{this.state.customer.city}</li>
    </ul>
      <form onSubmit={this.onEditCustomer} onChange={this.onEditCustomerFormChanged}>
        <label>Name:<input type="text" name="newName" value={this.state.newName}/></label>
        <label>City:<input type="text" name="newCity" value={this.state.newCity}/></label>
        <input type = "submit" value="Edit customer" />
      </form>
    </div>
  }
}

class Routes extends React.Component {
  render() {
    return <Router history={hashHistory}>
      <Route exact path="/" component={CustomerListComponent}/>
      <Route path="/customer/:customerId" component={CustomerDetailsComponent}/>
    </Router>;
  }
}

render(<div>
  <Menu/>
  <Routes/>
</div>, document.getElementById('root'));
