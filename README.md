# Netflix Project

Hello, in this project I have implemented the three requested functionalities.
1) HTTP Server with an endpoint to find a device id
2) An abstracted interface that supports Android iPhone and Tv
3) Preventing clients from using the same devices


# Design
##Model
A device pool is initialized with the devices in the devices.json list

##Service
Device - An abstract class that implements multiple base methods <BR>
Iphone, Android, Tv Service - Extends Device implements specific business logic<br>
Device Factory - A common interface to the 3 device classes

## Controller
Offer the APIs 

##Utils
Simple Logger<br>
Multiple application error definitions

#Commands
1. npm start
2. npm build 
3. npm build:prd -- removes tests

## Test Coverage
Unit testing was done with Jest, sinon, and supertest.

Coverage is roughly ~90%



##### Thank you
