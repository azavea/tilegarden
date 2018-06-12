# ADR 1: Choose serverless framework/utility

## Status
Proposed

## Context
Lambnik is currently written in Python and uses Chalice as a framework to handle development and deployment to AWS Lambda. As Chalice is a Python-specific tool, this raises issues when porting the tool to Node.js. To that end another framework must be selected.

The initial factor in this decision is a tool's functional similarity to Chalice as this should ease the translation of the project structure to the new set of technologies. As it stands, Chalice is used to deploy Lambnik and configure its connection with AWS's API Gateway. Resource provisioning is handled apart from Chalice which is an aspect of the project setup that will be preserved in order to provide for more configurability of data sources in the future. Other factors involved in choosing a framework include:
* Ability to connect to existing project resources,
* Ability to handle binary content in requests and responses,
* Integration into the Node ecosystem,
* Existence of local development tools for the framework,
* Extent of ongoing project support,
* Developer learning curve/support,
* Ability to automate more of the project than was handled previously.

Prospective frameworks/utilities were identified based on their ability to satisfy the functionality that Chalice currently performs, and are the following:
1. [Serverless](#serverless)
2. [Claudia](#claudia)
3. [Apex](#apex)
4. [Shep](#shep)

### Serverless
Serverless is one of the most popular serverless frameworks, its key selling point being its wide language support, service provider agnosticism, and ability to handle the configuration of an entire serverless project, including resource provisioning. This popularity comes with a high degree of customization potential with plugins, as well as robust examples and documentation. The broad language and provider support brings with it a lot of non-language-native boilerplate. There is a risk that the ability to work with a wide array of technologies comes at the cost of disobeying technology-specific conventions in order to provide a single, unified interface, which could lead to developer confusion. While Serverless is able to handle binary data such as images, [it requires multiple plugins to do so](https://medium.com/nextfaze/binary-responses-with-serverless-framework-and-api-gateway-5fde91376b76).

### Claudia
Claudia is a deployment utility built specifically for NodeJS and AWS Lambda. Its main design goal is to trade code portability and platform agnosticism for simplicity of workflow and the streamlining of basic tasks. Claudia also aims to implement features in ways that would seem intuitive to those familiar with the Node ecosystem, for instance modeling API Gateway as a JavaScript web server and routing code errors to 500 by default. "Behaving as JavaScript developers expect out of the box" cuts down on time spent learning new conventions in order to use the utility, something that is also helped by the large amount of documentation and examples available. It is not a framework, which cuts both ways: on one hand there are fewer constraints on code structure and low overhead, but on the other this could lead to poor code organization or a lack of extensibility down the line. [Claudia is able to handle requests and responses containing binary data out of the box.](https://claudiajs.com/tutorials/binary-content.html)

### Apex
Apex has robust support for testing, with support for discrete dev/prod environments, function hooks, and pre-defined testing CLI commands out of the box. Apex's main selling point is its support for languages that AWS Lambda does not support by default, such as Golang (in which it is written). Documentation is not as robust as that for Claudia or Serverless, and it abstracts away far less lambda setup.

### Shep
Like Claudia, Shep is only a deployment tool. It concerns itself simply with abstracting away much of the AWS deployment CLI and AWS Lambda setup. Its simplicity comes at the cost of functionality and extensibility and it lacks much of the documentation of the aforementioned frameworks and utilities.

## Decision
We will use Claudia/Claudia API Builder as a development utility/API Framework in order to cut down on unnecessary initial bloat and learning curve steepness. Of the four options, Claudia stays the closest to Chalice in terms of functionality while also operating the most natively to the Node ecosystem. While Serverless performs all the functions of Claudia (and more), it also introduces boilerplate and bloat in service of supporting features that Tilegarden does not require. Additionally, compared to Serverless, Claudia requires less work to configure binary data responses, which is crucial as serving image files is Tilegarden's core purpose. Apex and Shep, for their part, lack much of the robust documentation, workflow abstraction, and integration with Node.js of the other options.

## Consequences
The consequences of this decision will be:
* Must switch frameworks if switching serverless provider,
* Resource provisioning is not handled by the framework and must be done manually or automated separately,
* The testing environment must be custom-built (although may be based upon existing Lambnik testing environment).
