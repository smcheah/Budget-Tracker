let db;
const request = indexedDB.open("database", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("storename", { autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        postData();
    }
};

request.onerror = (event) => {
    console.log("Error at indexedDB: ", event.target.errorCode);
};

function saveRecord (object) {
    transaction = db.transaction(["storename"], "readwrite");
    store = transaction.objectStore("storename");
    store.add(object);
}

function postData () {
    const transaction = db.transaction(["storename"], "readwrite");
    const store = transaction.objectStore("storename");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["storename"], "readwrite");
                    const store = transaction.objectStore("storename");
                    store.clear();
                });
        }
    };
}

window.addEventListener("online", postData);
