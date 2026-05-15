const SUPABASE_URL = 'https://uqijorymsxivkdhmnyf.supabase.co';
const SUPABASE_KEY = '你的key';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let incomes=[];
let expenses=[];
let wages=[];

async function loadCloudData(){
  const {data,error}=await supabaseClient
    .from('restaurant_data')
    .select('*')
    .order('created_at');

  if(error){
    console.log(error);
    return;
  }

  incomes=data.filter(x=>x.type==='income');
  expenses=data.filter(x=>x.type==='expense');
  wages=data.filter(x=>x.type==='wage');

  render();
}

async function saveIncome(){
  const item={
    type:'income',
    date:incomeDate.value,
    cash:+cash.value||0,
    card:+card.value||0,
    uber:+uber.value||0,
    doordash:+doordash.value||0,
    panda:+panda.value||0
  };

  await supabaseClient.from('restaurant_data').insert(item);
  incomes.push(item);
  render();
}

async function saveExpense(){
  const item={
    type:'expense',
    date:expenseDate.value,
    category:expenseType.value,
    name:expenseName.value,
    amount:+expenseAmount.value||0
  };

  await supabaseClient.from('restaurant_data').insert(item);
  expenses.push(item);
  render();
}

async function saveWage(){
  const item={
    type:'wage',
    date:wageDate.value,
    employee:employee.value,
    amount:+wageAmount.value||0
  };

  await supabaseClient.from('restaurant_data').insert(item);
  wages.push(item);
  render();
}

function render(){
  console.log('cloud sync active');
}

loadCloudData();
