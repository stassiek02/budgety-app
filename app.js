


//BUGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.precentage = -1;
    };

    Expense.prototype.calcPercentage  = function(totalIncome){
        if(totalIncome>0){
            this.precentage = Math.round((this.value/ totalIncome)*100);
        } else{
        this.precentage = -1;
        }
    };
    
    Expense.prototype.getPercentages = function(){
        return this.precentage;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses = 0;

    var calculateTotal= function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;

    };

   

    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals:{
            exp:0,
            inc :0
        },
        budget:0,
        precentage:-1
    };

    return {
        addItem: function(type, des, val){
            var newItem,ID;
           

            //create new ID
            if(data.allItems[type].length > 0){
                
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID=0;
            }

            
            

            if(type ==='exp'){
                newItem = new Expense(ID, des, val); 
            }
             else if( type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            
            //push it into our data structure
            data.allItems[type].push(newItem);
            //return the new item
            return newItem;

        },
        deleteItem : function(type,id){
            var ids ,index;

         ids = data.allItems[type].map(function(current){
                return current.id;


            });
            index = ids.indexOf(id);

            if(index !== -1 ){
                data.allItems[type].splice(index,1);
            }

        },
        



        calculateBudget : function(){
            //calulate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc- data.totals.exp;

            // calculate the precentage of icome that we spent
            if( data.totals.inc > 0){
            data.precentage = Math.round((data.totals.exp / data.totals.inc)*100);
            } else {
                data.precentage = -1;
            }
            //
        },
        calculatePercentages : function(){
             
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })


        },
        getPercentages:function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentages();
            });
            return allPerc;

        },


        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExpenses: data.totals.exp,
                precentage: data.precentage,
            }
        },

        testing: function(){
            console.log(data);
        }
    }


})();
//UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn : '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel: '.budget__title--month'

    };

  var formatNumber = function(num,type){
        var numSplit,int,dec;
        /*
           + or - before number
           exactly 2 decimal points
           comma separating the thousands 
        */
       num = Math.abs(num);
       num = num.toFixed(2);
       
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length >3){
           int = int.substr(0,int.length-3) +',' + int.substr(int.length-3,int.length);
        }



        dec = numSplit[1];

        

        return (type === 'exp' ? '-' : '+') + ' ' + int +'.'+dec;
    };
    var nodeListForEach = function(list,callback){
        for (var i = 0; i< list.length;i++ ){

            callback(list[i],i);

        }
    };


    return{
        getInput: function(){
            return {
            type : document.querySelector(DOMstrings.inputType).value,
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            
            };
            
        },

        addListItem: function(obj,type){
            var html,newHtml,element;
            //create html string with placeholder text    
            if (type === 'inc'){
                element= DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp' ){
                element= DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                 }
            // replace the placeholder text with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);     
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            

            // insert the html into the dom
                document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);


        },

        deleteListItem: function(selectorID){
            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },
    
        clearFields:function(){
            var fields,fieldsArr;
           fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' +DOMstrings.inputValue);

           var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        

        displayBudget: function(obj){

            obj.budget > 0 ? type = 'inc':type= 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses,'exp');
            

            if(obj.percentageLabel > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.precentage + '%';
            } else{
                document.querySelector(DOMstrings.percentageLabel).textContent =  '---';
            }

        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

 
            nodeListForEach(fields,function(current,index){
                if(percentages[index]>0 )
                current.textContent = percentages[index]+ '%';
                else
                current.textContent = '---';
                //do stuff
            });

        },

        
        displayMonth: function(){
            var now,year,month;

             now = new Date();
             year = now.getFullYear();
             month = now.getMonth();
             document.querySelector(DOMstrings.dateLabel).textContent= (month+1) + ' '+year;
            

        },

        changedType : function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType+','+
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
                nodeListForEach(fields,function(cur){
                    cur.classList.toggle('red-focus');

                });
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            },
        

        getDOMstrings : function(){
            return DOMstrings;
        }
    }






})();




//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){

    var setupEventListeners = function(){
        var DOM = UIController.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
            if (event.keyCode ===  13 || event.which === 13){
                ctrlAddItem();
    }

        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType)
    };

    var updatePercentages = function(){
        //1.calculate percentages
        budgetCtrl.calculatePercentages();


        //2.read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();


        //3.update the ui 
        UICtrl.displayPercentages(percentages);


    };
    updatePercentages();

    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
       UICtrl.displayBudget(budget);

       updatePercentages();


        
    };
    
    
    var ctrlAddItem = function(){
        var input, newItem;

    //1.get the field input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) &&input.value > 0 ){

    //2.add the item the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description,input.value);


    //3. add the item to the ui
        UICtrl.addListItem(newItem, input.type);

     //4.clear the fields
        UICtrl.clearFields();   
    //calculate and update budget
    updateBudget();


    //6.calculate and update budget


        }
       
    };

    var ctrlDeleteItem = function(event){
        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID){
            //inc

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1.delete the item from data structure
            budgetCtrl.deleteItem(type,ID);
            //2. delete the item from ui
            UICtrl.deleteListItem(itemID);
            //3.update and show the budget
            updateBudget();
        }

    };




    return{
        init:function(){
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExpenses:0,
                precentage:-1,
            });
            setupEventListeners();

        }
    }


})(budgetController,UIController);

controller.init();