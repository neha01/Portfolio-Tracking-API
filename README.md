# Portfolio Tracking API
Portfolio Tracking API to perform CRUD operations on trades placed & to fetch portfolio, returns & holdings. </br>
The API is hosted on <a href="https://portfolio-tracking-crud-api.herokuapp.com/">Heroku</a> and is connected to a Mongodb Atlas Cluster.

## Documentation
### All Available Routes and their documentation can be found at:
* <a href ="https://documenter.getpostman.com/view/4262769/T1Dv8aWM?version=latest"> Postman</a></br>
Import the collection from above URL to run it directly from Postman.</br>

### Prerequsites
Node (tested on v12) </br>
MongoDb (tested on v4.2)

### Running it on Local Machine
1. Clone the repository and install dependencies by running below command </br>
#### git clone https://github.com/neha01/Portfolio-Tracking-API.git && cd Portfolio-Tracking-API && npm i
</br>
2. Install Mongodb and run it on localhost. </br>
3. <b>npm run dev </b></br>
Above command will start the server on 'dev' environment with default configurations present in  config/dev.json file.


## Assumptions and Edge Cases handling
1. **Update Trade:**  <br>
Only the price and quantity of trade can be updated.<br>
Note updating the operation of a trade is not allowed : In case user wants to change the operation of a trade for instance from BUY to SELL; then the user can delete that trade ; and place a new trade.<br>
**In Some cases the trade cannot be updated.**<br>
Suppose a trade for BUY 5 shares of 'INFY' is placed.<br>
Then another trade for SELL 5 shares of 'INFY' is placed <br>
Now the final shares is 0 for 'INFY'. <br>
Now the trade corresponding to BUY 5 shares of INFY cannot be updated to BUY 4 shares of INFY since that will mean the net change in shares is -1 ; 
which means one share should be removed form the security; but since the security final share is already 0; this is not possible.<br>
However it is possible to update the BUY 5 shares trade to BUY 6 shares trade; that will add 1 share to security and will also recalculate the prices 
based on new trade price & quantity.
2. **Delete Trade**<br>
Trades that make the final share quantity as negative can not be deleted.(Similar example as above)
3. **Create Trade**<br> 
Currently there is no check for the mismatch between the ticker sent in request parameter and in body; if they mismatch ; the **ticker sent in body** will be treated as the final data.

## Design decisions
* The Application is divided into models,routes,controllers and services <br>
Every route has designated controller which then calls the respective services.<br>
This way Services makes the code reuasble across multiple controllers.<br>
This avoids bloating controllers with lot of code and improves code reuse among different controllers.<br>
* MongoDb aggregations are used for improved performance and code readability
* BigNumber.js library is used to handle precise floating point calculations
* Basic data validations are done with Joi
* Logging is done with winston and morgan.
* Formatting & Liniting is done with prettier & eslint.
* Coding conventions are enforced with pre commit hooks by Husky.
* While returning the results for portfolio/holdings/returns decimal entites are rounded upto 4 decimal places (possibly for better user experience).
However they are stored in full precision in Db.


## Improvements 
* All errors codes alongwith their respective messages can be defined at one place and reused.
* MongoDB transactions should be used to update both security and trades together in Db else there might be a possiblilty of 
inconsisitency when one entity updated without the other due to a bug/ app failure
* Populate all the models in app.locals.model at the time of app initialisation and then these models can be loaded in services via their 
constructors and services can be exposed as singletons in app.locals.
* Mongoose pagination can be added
* pm2 can be used for process management.
* Request compression should be done ideally with a reverse proxy eg: Ngnix. 
* Test cases can be added with Mocha and Chai.


## Test Cases 
1. All basic validations -> price , quantiy is negative and not sending required parameters in body/request
2. All routes basic testing and ascertaining calculations are correct.
3. Updating/Deleting trades that makes final quantity of security negative.
4. Deleting all the trades for a corresponding security and ensuring the security is not present in holdings.
5. Selling shares of a security which is not present in holdings should result in error.
6. Multiple trades for a particular security should reflect in portfolio.
7. Updating the trades should reflect accurate average price calculations in holdings & returns.


