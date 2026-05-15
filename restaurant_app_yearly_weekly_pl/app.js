const today = new Date().toISOString().slice(0,10);
document.getElementById("yearInput").value=new Date().getFullYear();
let incomes=JSON.parse(localStorage.getItem("yearweek_incomes")||"{}");
let expenses=JSON.parse(localStorage.getItem("yearweek_expenses")||"[]");
let wages=JSON.parse(localStorage.getItem("yearweek_wages")||"[]");
const cats={
"采购":["肉类","蔬菜","海鲜","米面粮油","调料","饮料","酒水","包装用品","清洁用品","中央厨房","其他采购"],
"工资外支出":["临时工","员工餐","员工补贴","培训","其他"],
"租金/固定":["房租","水费","电费","煤气","保险","会计","网络电话","其他固定"],
"维修":["冰箱维修","油烟机维修","POS维修","厨房设备","水电维修","机器保养","其他维修"],
"平台费用":["Uber佣金","DoorDash佣金","熊猫佣金","平台广告","退款/优惠","其他平台"],
"其他":["交通","杂费","设备购买","清洁","证照费用","其他"]
};
function setExpenseOptions(){expenseCategory.innerHTML=cats[expenseType.value].map(x=>`<option>${x}</option>`).join(""); expenseName.value=expenseCategory.value}
expenseCategory?.addEventListener("change",()=>expenseName.value=expenseCategory.value);
setExpenseOptions();
function go(id,el){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll(".nav").forEach(n=>n.classList.remove("active"));el.classList.add("active");render()}
function money(n){return "$"+(Number(n)||0).toFixed(2)} 
function pct(n){return ((Number(n)||0)*100).toFixed(1)+"%"}
function save(){localStorage.setItem("yearweek_incomes",JSON.stringify(incomes));localStorage.setItem("yearweek_expenses",JSON.stringify(expenses));localStorage.setItem("yearweek_wages",JSON.stringify(wages))}
function parseDate(s){let p=s.split("-").map(Number);return new Date(p[0],p[1]-1,p[2])}
function dateStr(d){return d.toISOString().slice(0,10)} 
function startOfWeek(d){let x=new Date(d);let day=x.getDay();let diff=(day===0?-6:1-day);x.setDate(x.getDate()+diff);return x}
function endOfWeek(d){let s=startOfWeek(d);let e=new Date(s);e.setDate(s.getDate()+6);return e}
function inRange(x,s,e){return x>=dateStr(s)&&x<=dateStr(e)} 
function sameMonth(x,dt){let d=parseDate(x);return d.getFullYear()===dt.getFullYear()&&d.getMonth()===dt.getMonth()}
function prevWeekRange(dt){let s=startOfWeek(dt);s.setDate(s.getDate()-7);let e=new Date(s);e.setDate(s.getDate()+6);return[s,e]}
function prevMonthDate(dt){return new Date(dt.getFullYear(),dt.getMonth()-1,1)}
function incomeTotal(x){return (x.cash||0)+(x.card||0)+(x.delivery||0)}
function saveIncome(){const d=incomeDate.value,delivery=(+uber.value||0)+(+doordash.value||0)+(+panda.value||0);incomes[d]={date:d,cash:+cash.value||0,card:+card.value||0,uber:+uber.value||0,doordash:+doordash.value||0,panda:+panda.value||0,delivery,dineinOrders:+dineinOrders.value||0,deliveryOrders:+deliveryOrders.value||0,note:incomeNote.value||"",updatedAt:new Date().toISOString()};save();["cash","card","uber","doordash","panda","dineinOrders","deliveryOrders","incomeNote"].forEach(id=>document.getElementById(id).value="");render();alert("收入已保存")}
function saveExpense(){expenses.push({date:expenseDate.value,type:expenseType.value,cat:expenseCategory.value,name:expenseName.value||expenseCategory.value,supplier:expenseSupplier.value,amount:+expenseAmount.value||0,pay:expensePay.value,isFixed:isFixed.value,isDailySplit:isDailySplit.value,note:expenseNote.value,createdAt:new Date().toISOString()});save();["expenseName","expenseSupplier","expenseAmount","expenseNote"].forEach(id=>document.getElementById(id).value="");render();alert("支出已保存")}
function calcWage(){wageAmount.value=((+hours.value||0)*(+rate.value||0)).toFixed(2)}
function saveWage(){wages.push({date:wageDate.value,employee:employee.value,role:role.value,hours:+hours.value||0,rate:+rate.value||0,amount:+wageAmount.value||0,pay:wagePay.value,note:wageNote.value,createdAt:new Date().toISOString()});save();["employee","hours","rate","wageAmount","wageNote"].forEach(id=>document.getElementById(id).value="");render();alert("工资已保存")}
function delItem(type,i){if(type==="e")expenses.splice(i,1);if(type==="w")wages.splice(i,1);save();render()}
function calcPeriod(fn){let revenue=0,cash=0,card=0,delivery=0,orders=0,purchase=0,wage=0,fixed=0,repair=0,platform=0,other=0,cashPaid=0,lossDays=0,days=0;Object.keys(incomes).forEach(d=>{if(fn(d)){let x=incomes[d],r=incomeTotal(x);revenue+=r;cash+=x.cash||0;card+=x.card||0;delivery+=x.delivery||0;orders+=(x.dineinOrders||0)+(x.deliveryOrders||0);if(r>0)days++}});expenses.forEach(x=>{if(fn(x.date)){if(x.type==="采购")purchase+=x.amount;else if(x.type==="租金/固定")fixed+=x.amount;else if(x.type==="维修")repair+=x.amount;else if(x.type==="平台费用")platform+=x.amount;else other+=x.amount;if(x.pay==="现金")cashPaid+=x.amount}});wages.forEach(x=>{if(fn(x.date)){wage+=x.amount;if(x.pay==="现金")cashPaid+=x.amount}});Object.keys(incomes).forEach(d=>{if(fn(d)){let x=incomes[d],r=incomeTotal(x);let e=expenses.filter(v=>v.date===d).reduce((s,v)=>s+v.amount,0);let w=wages.filter(v=>v.date===d).reduce((s,v)=>s+v.amount,0);if(r-(e+w)<0)lossDays++}});let expense=purchase+wage+fixed+repair+platform+other;return{revenue,cash,card,delivery,orders,purchase,wage,fixed,repair,platform,other,expense,profit:revenue-expense,cashPaid,cashNet:cash-cashPaid,lossDays,days}}
function compare(cur,prev){if(prev===0)return cur>0?"+100%":"0%";let v=(cur-prev)/prev*100;return (v>=0?"+":"")+v.toFixed(1)+"%"}
function renderYearlyWeeks(){
  const year=+document.getElementById("yearInput").value||new Date().getFullYear();
  let firstMonday=startOfWeek(new Date(year,0,1));
  let rows="", yearProfit=0, lossWeeks=0, profitWeeks=0, bestProfit=-Infinity, bestLabel="$0";
  for(let i=0;i<54;i++){
    let s=new Date(firstMonday); s.setDate(firstMonday.getDate()+i*7);
    let e=new Date(s); e.setDate(s.getDate()+6);
    if(s.getFullYear()>year && i>0) break;
    if(e.getFullYear()<year) continue;
    let data=calcPeriod(x=>inRange(x,s,e));
    let hasData=data.revenue>0 || data.expense>0;
    let cls=hasData?(data.profit>=0?"week-good":"week-bad"):"week-empty";
    let status=hasData?(data.profit>=0?"盈利":"亏损"):"无数据";
    if(hasData){
      yearProfit+=data.profit;
      if(data.profit>=0) profitWeeks++; else lossWeeks++;
      if(data.profit>bestProfit){bestProfit=data.profit;bestLabel=money(data.profit);}
    }
    let profitClass=data.profit>=0?"profit-plus":"profit-minus";
    rows+=`<tr class="${cls}"><td>第${i+1}周</td><td>${dateStr(s)} 至 ${dateStr(e)}</td><td>${money(data.revenue)}</td><td>${money(data.expense)}</td><td class="${profitClass}">${money(data.profit)}</td><td>${status}</td></tr>`;
  }
  yearWeekTable.innerHTML=rows;
  yearProfit.textContent=money(yearProfit);
  lossWeeks.textContent=lossWeeks;
  profitWeeks.textContent=profitWeeks;
  bestWeek.textContent=bestProfit===-Infinity?"$0":bestLabel;
}
function render(){
const d=viewDate.value||today,dt=parseDate(d),ws=startOfWeek(dt),we=endOfWeek(dt),[pws,pwe]=prevWeekRange(dt),pmd=prevMonthDate(dt);
const day=calcPeriod(x=>x===d),week=calcPeriod(x=>inRange(x,ws,we)),pweek=calcPeriod(x=>inRange(x,pws,pwe)),month=calcPeriod(x=>sameMonth(x,dt)),pmonth=calcPeriod(x=>sameMonth(x,pmd));
dayRevenue.textContent=money(day.revenue);dayProfit.textContent=money(day.profit);dayProfitBox.className="stat "+(day.profit>=0?"good":"bad");dayExpense.textContent=money(day.expense);dayOrders.textContent=day.orders;avgOrder.textContent=money(day.orders?day.revenue/day.orders:0);cashNet.textContent=money(day.cashNet);
weekRevenue.textContent=money(week.revenue);weekProfit.textContent=money(week.profit);weekProfitBox.className="stat "+(week.profit>=0?"good":"bad");weekPurchase.textContent=money(week.purchase);weekWage.textContent=money(week.wage);weekRent.textContent=money(week.fixed);weekOther.textContent=money(week.repair+week.platform+week.other);weekNetRate.textContent=week.revenue?pct(week.profit/week.revenue):"0%";weekCompare.textContent=compare(week.revenue,pweek.revenue);
monthRevenue.textContent=money(month.revenue);monthProfit.textContent=money(month.profit);monthProfitBox.className="stat "+(month.profit>=0?"good":"bad");monthPurchase.textContent=money(month.purchase);monthWage.textContent=money(month.wage);monthFixed.textContent=money(month.fixed);lossDays.textContent=month.lossDays;
let weekMsg="暂无周数据。";if(week.revenue>0||week.expense>0){let nr=week.revenue?week.profit/week.revenue:0;if(week.profit<=0)weekMsg="❌ 本周没有盈利。星期天结算时要重点看工资、采购和租金日均。";else if(nr<0.08)weekMsg="⚠️ 本周有盈利，但利润偏薄。";else weekMsg="✅ 本周盈利情况可以。";}weekJudgement.textContent=weekMsg;
let msg="暂无数据。";if(month.revenue>0){let nr=month.profit/month.revenue,pr=month.purchase/month.revenue,wr=month.wage/month.revenue;if(month.profit<=0)msg="❌ 本月暂时没有盈利。重点检查营业额、采购、工资和固定支出。";else if(nr<0.08)msg="⚠️ 本月有盈利，但利润偏薄。";else msg="✅ 本月有盈利，经营状态可以继续观察。";if(pr>0.4)msg+=" 采购占比偏高。";if(wr>0.35)msg+=" 工资占比偏高。";}judgement.textContent=msg;
incomeTable.innerHTML=Object.keys(incomes).sort().map(k=>{let x=incomes[k],r=incomeTotal(x),o=(x.dineinOrders||0)+(x.deliveryOrders||0);return`<tr><td>${k}</td><td>${money(x.cash||0)}</td><td>${money(x.card||0)}</td><td>${money(x.delivery||0)}</td><td>${o}</td><td>${money(r)}</td></tr>`}).join("");
expenseTable.innerHTML=expenses.map((x,i)=>`<tr><td>${x.date}</td><td>${x.type}</td><td>${x.name||x.cat}</td><td>${money(x.amount)}</td><td>${x.pay}</td><td><button class="danger" onclick="delItem('e',${i})">删</button></td></tr>`).join("");
wageTable.innerHTML=wages.map((x,i)=>`<tr><td>${x.date}</td><td>${x.employee||""}</td><td>${x.hours}</td><td>${money(x.amount)}</td><td>${x.pay}</td><td><button class="danger" onclick="delItem('w',${i})">删</button></td></tr>`).join("");
renderYearlyWeeks();
}
function exportCSV(){let rows=[["类型","日期","大类/员工","名称/小时","金额","支付","供应商","备注"]];Object.keys(incomes).forEach(d=>{let x=incomes[d];rows.push(["收入",d,"现金","",x.cash,"","",""]);rows.push(["收入",d,"刷卡","",x.card,"","",""]);rows.push(["收入",d,"外卖","",x.delivery,"","",x.note||""])});expenses.forEach(x=>rows.push(["支出",x.date,x.type,x.name||x.cat,x.amount,x.pay,x.supplier||"",x.note||""]));wages.forEach(x=>rows.push(["工资",x.date,x.employee,x.hours,x.amount,x.pay,"",x.note||""]));let csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");let blob=new Blob(["\ufeff"+csv],{type:"text/csv"});let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="restaurant_yearly_weekly_pl_export.csv";a.click()}
render();
