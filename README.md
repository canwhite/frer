# frer
fre's state management library，written in rxjs，also for vue, react, angular, node...


## install
```
npm i frer
or
yarn add frer
```
## support ts
```
eslint processing.    

.eslintrx.js

  env: {
    ...
    es6:true,//   Parsing error: The keyword 'export' is reserved
  }
  
.eslintignore
  node_modules


```


## main api
```
state({
    name:"xxx",//key
    initValue:xxx, //init data
    producer(next,value,action){...}
})


dispatch(name,{
    type:"add" 
})

PS:
Synchronous and asynchronous APIs are used in the same way
```

## Use in fre
>store.js
```
import { state } from "frer";

//sync
const count$ = state({
    name: "count",//key 
    initValue: 0,//init data
    producer(next,value,action){
        let num = value;
        console.log(num);
        switch(action.type){
            case "add":
                num ++ ;
                next(num);//send data
                break;
            case "sub":
                num--;
                next(num)
                break;
        }
    }
});

//async
const async_res$ = state({ 
    name:"async_res",
    initValue:"",
    producer(next,value,action){
        let params = action.payload;//params
        let request = action.request;//methods :return Promise 
        switch (action.type){
            case "async":
                request(params).then(res=>{
                    next(res);
                })
            break;
        }
    }
}) 
export {
    count$,
    async_res$,
}

```
>App.js
```
import { render, Fragment, h, useState,useEffect} from 'fre'
import { dispatch} from 'frer';
import {count$,async_res$} from './store'

function App() {

  const [count ,setCount] = useState(0);
  const [data , setData] = useState("");
  
  useEffect(() => {
    count$.subscribe(val=>{
      setCount(val);
    })
    async_res$.subscribe(val=>{
      setData(val.data);
    })
  }, [])

  const getRequestData = (params)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(() => {
            resolve({data:"content"})
        }, 3000);
    })
  }

  return (
    <div>

      {/* sync */}
      <div>{count} </div>
      <div>
        <button onClick={() => {
          dispatch("count",{
              type:"add"
          })
        }}>add</button>
        <button onClick={() => {
          dispatch("count",{
              type:"sub"
          })
        }}>sub</button>
      </div>


      {/* async */}
      <div> 
        <button onClick={() => {
          dispatch("async_res",{
            type:"async",
            payload:{a:"123"},
            request:getRequestData
          })
        }}>async test</button>
      </div>
      <div>{data}</div>
    </div>
  )
}

render(<App />, document.getElementById('app'))

```
PS：  
Observable can be subscribed in different components to ensure the unity of state

## expand

Just for fre, other frameworks can also be used if you want;  
* The use of react is the same as fre;
* Vue subscribes in mounted, and sets the value in data to take over
* angular have not been tested
* svelte
```
-----------
App.svelte
-----------

<script>
	import {onMount,onDestroy } from "svelte";
	import {count$} from "./store.js"
	import {dispatch} from "frer"
	let c = 0;

	function add(){
		dispatch("count",{
			type:"add"
		})
	}
	function sub(){
		dispatch("count",{
			type:"sub"
		})
	}
	onMount(async () => {
		count$.subscribe(val=>{
			c = val;
		})
	});
</script>

<div>{c}</div>
<button on:click={add}>add</button>
<button on:click={sub}>sub</button>


```
* Node.js
```
let state = require("frer").state
let dispatch = require("frer").dispatch;

const count$ = state({
    name: "count",//key 
    initValue: 0,//init data
    producer(next,value,action){
        let num = value;
        console.log(num);
        switch(action.type){
            case "add":
                num ++ ;
                next(num);//send data
                break;
            case "sub":
                num--;
                next(num)
                break;
        }
    }
});

count$.subscribe(val=>{
    console.log(val);
})

dispatch("count",{
    type:"add"
})

```


