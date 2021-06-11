/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Authority extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const propertys = [         
            
        ];

        for (let i = 0; i < propertys.length; i++) {
            propertys[i].docType = 'application';
            await ctx.stub.putState('PROPERTY' + i, Buffer.from(JSON.stringify(propertys[i])));
            console.info('Added <--> ', propertys[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryProperty(ctx, propertyNumber) {
        const propAsBytes = await ctx.stub.getState(propertyNumber); // get the car from chaincode state
        if (!propAsBytes || propAsBytes.length === 0) {
            throw new Error(`${propertyNumber} does not exist`);
        }
        console.log(propAsBytes.toString());
        return propAsBytes.toString();
    }

    async createProperty(ctx, propertyNumber, prop_id, exact_address, town, postcode, appraised_value , wanted_value, current_owner_id, application_ipfs, old_owner_id, sold_price, status, auth_s_id, bank_loan_id ) {
        console.info('============= START : Create Property ===========');

        const property = {
            docType: 'application',
            prop_id,
            exact_address,
            town,
            postcode,
            appraised_value,
            wanted_value,
            current_owner_id,
            application_ipfs,
            status,
            old_owner_id,
            sold_price,
            auth_s_id,
            bank_loan_id
        };

        await ctx.stub.putState(propertyNumber, Buffer.from(JSON.stringify(property)));
        console.info('============= END : Create Property ===========');
    }

    async queryAllPropertys(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changePropertyOwner(ctx, propertyNumber, newOwner, soldPrice, current_owner_id) {
        console.info('============= START : changePropertyOwner ===========');

        const propAsBytes = await ctx.stub.getState(propertyNumber); // get the car from chaincode state
        if (!propAsBytes || propAsBytes.length === 0) {
            throw new Error(`${propertyNumber} does not exist`);
        }
        const property = JSON.parse(propAsBytes.toString());
        property.sold_price = soldPrice
        property.old_owner_id = current_owner_id;
        property.current_owner_id = newOwner;

        await ctx.stub.putState(propertyNumber, Buffer.from(JSON.stringify(property)));
        console.info('============= END : changePropertyOwner ===========');
    }

}

module.exports = Authority;
