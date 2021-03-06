import {BankAccount} from "./BankAccount";
import { TransactionOrigin} from "../common/enums/TransactionOrigin";
import { Transaction } from "../common/interfaces/Transaction";

export class SavingsAccount extends BankAccount {
    constructor(public currentDate: Date) {
        super();
        this.balance = 10000;
        this.accountHistory = [];
    }

    accountHolderBirthDate: Date;

    monthDiff(d1: Date, d2: Date): number {
        let months: number;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    advanceDate(numberOfDays: number) {
        let dateClone = new Date(this.currentDate.getTime());

        this.currentDate.setDate(this.currentDate.getDate() + numberOfDays);
        let numberOfMonths = this.monthDiff(dateClone, this.currentDate);
        dateClone.setDate(1);

        for(let i = 0; i < numberOfMonths; i++){
            dateClone.setMonth(dateClone.getMonth() + 1);
            let interestTot = this.interestRateCalculator();
            interestTot = Number.parseFloat(interestTot.toFixed(2))
            this.balance += interestTot;
            this.balance = Number.parseFloat(this.balance.toFixed(2));
            // trans is of type Transaction .. interface kind of blah
            let trans = {
                success: true,
                amount: interestTot, // amount will be positive for deposits and negative for withdrawals
                resultBalance: this.balance, // resultBalance will be unchanged from the previous balance when success is false
                transactionDate: dateClone,
                description: "Interest Payment",
                errorMessage: "" // errorMessage will be an empty string when success is true
            };
            this.accountHistory.push(trans);
        }

    }



    withdrawWithInsufficaientFunds() {
        if (this.balance <= this.balance) {
            throw new Error('Insufficient funds');
        }
    }


    depositMoney(amount: number, description: string): Transaction {
        let savingAccountTransaction = {
            success: true,
            amount: amount,
            resultBalance: this.balance + amount,
            transactionDate: this.currentDate,
            description: description,
            errorMessage: "" // errorMessage will be an empty string when success is true
        };
        this.balance = this.balance + amount;
        this.accountHistory.push(savingAccountTransaction);
        return savingAccountTransaction;
    }

    withdrawMoney(amount: number, description: string, transactionOrigin: TransactionOrigin): Transaction {
        let savingWithdrawMoney = < Transaction > {
            amount: -amount,
            transactionDate: this.currentDate,
            description: description,
        };

        if(amount >= this.balance){
            savingWithdrawMoney.success = false;
            savingWithdrawMoney.resultBalance = this.balance;
            savingWithdrawMoney.errorMessage = "Insuffient Funds";
            return savingWithdrawMoney;
        }
        if (this.checkWebAndPhone()) {
            savingWithdrawMoney.success = false;
            savingWithdrawMoney.resultBalance = this.balance;
           // console.log(this.balance);
            savingWithdrawMoney.errorMessage = "Can't transfer more than six times via phone/web per month.";
            return savingWithdrawMoney;
        }

        this.balance = this.balance - amount;
        savingWithdrawMoney.success = true;
        savingWithdrawMoney.resultBalance = this.balance;
        savingWithdrawMoney.errorMessage= "";
        savingWithdrawMoney.transactionOrigin = transactionOrigin;
        this.accountHistory.push(savingWithdrawMoney);
        // console.log(this.balance);

        return savingWithdrawMoney;
    }

    private checkWebAndPhone(): boolean {
        // console.log("checking web and phone");
        //todo right now counter is being reset to zero
        //todo set counter as a property
        //todo need to reset counter for each calendar month
        let counter = 0;
        for(var i = 0; i < this.accountHistory.length; i++) {
            let transaction = this.accountHistory[i];
            // console.log(transaction.transactionDate, transaction.transactionOrigin);
            if (transaction.transactionOrigin === TransactionOrigin.WEB ||
                transaction.transactionOrigin === TransactionOrigin.PHONE) {
                if (this.currentDate.getMonth() === transaction.transactionDate.getMonth() &&
                    this.currentDate.getFullYear() === transaction.transactionDate.getFullYear()) {
                    // console.log("encomenting counter");
                    counter++;
                }
            }
        }
        // console.log(counter);
        if (counter <= 6)
        {
            // console.log("returning false");
            return false;
        }
        // console.log("returning true");

        return true;
    }

    interestRateCalculator(): number {

        let interest: number, total: number, rate: number;
        rate = .02;
        interest = this.balance * rate / 12;

        return interest;
    }

}