/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Bank extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const applications = [
     
        ];

        for (let i = 0; i < applications.length; i++) {
            applications[i].docType = 'application';
            await ctx.stub.putState('app' + i, Buffer.from(JSON.stringify(applications[i])));
            console.info('Added <--> ', applications[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryApp(ctx, userID) {
        const appAsBytes = await ctx.stub.getState(userID);
        if (!appAsBytes || appAsBytes.length === 0) {
            return "No application for that user"
        }
        console.log(appAsBytes.toString());
        return appAsBytes.toString();
    }

    async queryAppUID(ctx, applicationID) {
        const appAsBytes = await ctx.stub.getState(applicationID);
        if (!appAsBytes || appAsBytes.length === 0) {
            throw new Error(`${applicationID} does not exist`);
        }
        console.log(appAsBytes.toString());
        return appAsBytes.toString();
    }


    async createApplication(ctx, applicationID, userID, requestedAmount, prop_current_id, prop_buy_id, bank_w_id, status, approviedValue, notes) {
        console.info('============= START : Create App ===========');

        const application = {
            docType: 'application',
            userID,
            requestedAmount,
            prop_current_id,
            prop_buy_id,
            bank_w_id,
            status,
            approviedValue,
            notes
        };

        await ctx.stub.putState(applicationID, Buffer.from(JSON.stringify(application)));
        console.info('============= END : Create App ===========');
    }

    async queryAllApps(ctx) {
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

    async changeApplicationStatus(ctx, applicationID, bank_w_id, status, approviedValue, notes) {
        console.info('============= START : changeApplicationStatus ===========');

        const appAsBytes = await ctx.stub.getState(applicationID); // get the car from chaincode state
        if (!appAsBytes || appAsBytes.length === 0) {
            throw new Error(`${applicationID} does not exist`);
        }
        const app = JSON.parse(appAsBytes.toString());
        app.status = status;
        app.bank_w_id = bank_w_id;
        app.approviedValue = approviedValue;
        app.notes = notes;

        await ctx.stub.putState(applicationID, Buffer.from(JSON.stringify(app)));
        console.info('============= END : changeApplicationStatus ===========');
    }

}

module.exports = Bank;
