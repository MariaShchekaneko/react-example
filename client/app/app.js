// @flow

import React from 'react';
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

class Menu extends React.Component {
  render() {
    return <div>Menu: <a href="/#/">Customers</a></div>;
  }
}

class CustomerService {
  static instance=null;
  
  // Return singleton
  static get() {
    if(!CustomerService.instance)
      CustomerService.instance=new CustomerService();
    return CustomerService.instance;
  }
  
  getCustomers() {
    return fetch("/customers").then((response)=>{
      if(!response.ok) {
        throw response.statusText;
      }
      return response.json();
    });
  }
  
  getCustomer(customerId) {
    return fetch("/customers/"+customerId).then((response)=>{
      if(!response.ok) {
        throw response.statusText;
      }
      return response.json();
    });
  }
  
  addCustomer(name, city) {
    var body=JSON.stringify({name: name, city: city});
    return fetch("/customers", {method: "POST", headers: new Headers({'Content-Type': 'application/json'}), body: body}).then((response)=>{
      if(!response.ok) {
        throw response.statusText;
      }
      return response.json();
    });
  }
}

class CustomerListComponent extends React.Component {
  state={status: "", customers: [], newCustomerName: "", newCustomerCity: ""}
  
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
      this.setState({status: "successfully added new customer", customers: this.state.customers, newCustomerName: "", newCustomerCity: ""});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  
  render() {
    var listItems = this.state.customers.map((customer) => 
      <li key={customer.id}><a href={"/#/customer/"+customer.id}>{customer.name}</a></li>
    );
    return <div>status: {this.state.status}<br/><ul>{listItems}</ul>
        <form onSubmit={this.onNewCustomer} onChange={this.onNewCustomerFormChanged}>
          <label>Name:<input type="text" name="newCustomerName" value={this.state.newCustomerName} /></label>
          <label>City:<input type="text" name="newCustomerCity" value={this.state.newCustomerCity} /></label>
          <input type="submit" value="New Customer"/>
        </form>
      </div>
  }
}

class CustomerDetailsComponent extends React.Component {
  state={status: "", customer: {}}
  
  constructor(props) {
    super(props);
    
    CustomerService.get().getCustomer(props.params.customerId).then((result)=>{
      this.setState({status: "successfully loaded customer details", customer: result});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  
  render() {
    return <div>status: {this.state.status}<br/>
      <ul>
        <li>name: {this.state.customer.name}</li>
        <li>city: {this.state.customer.city}</li>
      </ul>
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
