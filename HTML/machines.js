async function loadMachines(){

    const response = await fetch("/machines", {
        method: "POST",
        mode: "no-cors", 
    });
    const data = await response.json();
    console.log(data);
}

loadMachines();