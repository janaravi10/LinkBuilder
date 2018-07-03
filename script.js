function verifyNum(element) {
    console.log(element);
    if (element>0) {
        return true;
    }else{
        return false;
    }
}

window.onload = wrapper;
function wrapper() {
    let saveBtn = document.querySelector("#saveBtn"),
        inputElem1 = document.querySelector("#startBtn"),
        inputElem2 = document.querySelector("#endBtn");
    saveBtn.addEventListener("click", handleClick);
    function handleClick() {
        let input1 = Number(inputElem1.value),
            input2 = Number(inputElem2.value);
        if (verifyNum(input1)===true && verifyNum(input2)===true) {
            if(input2 > input1){
                chrome.storage.local.set({ start: input1, end: input2 },(err)=>{
                     showNumValue();
                });
               
            }
        }
    }
    //show start and end value in the input box
    function showNumValue(){
        chrome.storage.local.get(["start","end"],(val)=>{
            console.log(val)
            if(val.start === undefined){
                chrome.storage.local.set({ start: 1, end: 999 });
                showNumValue();
            }else{
                inputElem1.value = val.start;
                inputElem2.value = val.end;
            }
        })
    }
    showNumValue();
    //show link count
    function showLinkCount(){
        let countSpan = document.getElementById("count");
        chrome.storage.local.get(["data"], (val) => {
        if(val.data==undefined){
            countSpan.innerText = 0
        }else{
            countSpan.innerText = val.data.length;
        }
        })
    }
    showLinkCount();
    //manage download of csv
    let downloadBtn = document.querySelector("#download");
    downloadBtn.addEventListener("click",handleDownload
);
    function handleDownload(){
        chrome.storage.local.get(["data"],(res)=>{
            if(res.data.length<=0){
                return;
            }
            let array = res.data,
                text = `category,start page,last page,domain,anchor text\r\n`;
            array.forEach(element => {
                text += `${element.href},${element.start},${element.end},${element.domain},${element.aText}\r\n`
            });
            let encodedUri = encodeURI(text);
            let link = document.createElement("a");
            link.setAttribute("href", "data:text/csv;charset=utf-8,\uFEFF" + encodedUri);
            link.setAttribute("download", "link.csv");
            link.click();
            chrome.storage.local.set({data:[]});
            showLinkCount();
        })
    
    }

    //Manage link deletion
    let delBtn = document.getElementById("DeleteAll");
    delBtn.addEventListener("click",handleDelete);
    function handleDelete(){
      chrome.storage.local.set({data:[]});
        showLinkCount();
    }
    //manage selective deletion
    let delLast = document.getElementById("deleteLast");
    delLast.addEventListener("click",handleSelectiveDel);
    function handleSelectiveDel(){
        let inputDel = Number(document.querySelector("#delInput").value);
        if(verifyNum(inputDel)){
            getData(handleres);
        }
        function handleres(data) {
            let array = data.data.map(e=>e);
            if(inputDel > array.length){
                array = [];
                chrome.storage.local.set({ data: array }, (err) => {
                    
                    showLinkCount();
                });
            }else{
                array.splice(array.length-inputDel,inputDel);
                chrome.storage.local.set({data: array},(err)=>{
                    
                    showLinkCount();
                });
            }
        }
      
    }
    //get links 
    function getData(fun){
      chrome.storage.local.get("data",fun);
    }
  //addLink From address bar
    let addressBarBtn = document.getElementById("AddressBarLink");
    addressBarBtn.addEventListener("click",handleAddressBarLink);
    function handleAddressBarLink(){
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { needLink: true }, function (response) {
                if(response.linkAdded===true){
                    showLinkCount();
                }
            });
        });
    }
} 