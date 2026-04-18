(async () => {
    const res = await fetch("https://api.libreborme.net/v1/empresa/search/?name=informatica&province=badajoz");
    const data = await res.json();
    console.log(data);
})();