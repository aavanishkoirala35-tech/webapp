let chart;

function addInstrumentRow(){

    const table =
    document.querySelector("#instrumentTable tbody");

    const rowCount =
    table.rows.length + 1;

    const row =
    table.insertRow();

    row.innerHTML = `

        <td>${rowCount}</td>

        <td>
            <input type="text">
        </td>

        <td>
            <input type="text">
        </td>

        <td>
            <input type="date">
        </td>

    `;

}

function addReadingRow(){

    const table =
    document.querySelector(
        "#readingTable tbody"
    );

    const row =
    document.createElement("tr");

    row.innerHTML = `

        <td>
            <input
            type="number"
            class="table-input"
            placeholder="Distance">
        </td>

        <td>
            <input
            type="number"
            class="table-input"
            placeholder="Voltage">
        </td>

        <td>
            <input
            type="number"
            class="table-input"
            placeholder="Current">
        </td>

        <td class="resistance-cell">
            0.00
        </td>

    `;

    table.appendChild(row);

}

function calculateData(){

    const rows =
    document.querySelectorAll("#readingTable tbody tr");

    let resistances = [];
    let distances = [];

    rows.forEach(row=>{

        const inputs =
        row.querySelectorAll("input");

        const distance =
        parseFloat(inputs[0].value) || 0;

        const voltage =
        parseFloat(inputs[1].value) || 0;

        const current =
        parseFloat(inputs[2].value) || 0;

        let resistance = 0;

        if(current !== 0){
            resistance = voltage/current;
        }

        row.querySelector(".resistance-cell").innerText =
        resistance.toFixed(2);

        resistances.push(resistance);
        distances.push(distance);

    });

    const avg =
    resistances.reduce((a,b)=>a+b,0) /
    resistances.length;

    const equivalent =
    Math.max(...resistances);

    const deviation =
    (
        (
            Math.max(...resistances) -
            Math.min(...resistances)
        ) / avg
    ) * 100;

    const desiredAccuracy =
    parseFloat(
        document.getElementById("desiredAccuracy").value
    );

    const status =
    deviation <= desiredAccuracy
    ? "PASS"
    : "FAIL";

    document.getElementById("avgResistance").innerText =
    avg.toFixed(2) + " Ω";

    document.getElementById("distance62").innerText =
    (
        parseFloat(
            document.getElementById("distanceBetween").value
        ) * 0.62
    ).toFixed(2) + " m";

    document.getElementById("equivalentResistance").innerText =
    equivalent.toFixed(2) + " Ω";

    document.getElementById("maxDeviation").innerText =
    deviation.toFixed(2) + " %";

    document.getElementById("accuracyStatus").innerText =
    status;

    generateChart(
        distances,
        resistances
    );

}

function generateChart(distances,resistances){

    const ctx =
    document.getElementById("resistanceChart");

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx,{

        type:'line',

        data:{

            labels:distances,

            datasets:[{

                label:'Resistance (Ω)',

                data:resistances,

                borderColor:'black',

                borderWidth:2,

                tension:0.3,

                fill:false

            }]

        }

    });

}

async function downloadPDFDirectly(){

    const { jsPDF } =
    window.jspdf;

    const pdfContent =
    document.querySelector(".pdf-page");

    const canvas =
    await html2canvas(pdfContent,{

        scale:2,
        useCORS:true

    });

    const imgData =
    canvas.toDataURL("image/png");

    const pdf =
    new jsPDF(
        "p",
        "mm",
        "a4"
    );

    const pdfWidth =
    pdf.internal.pageSize.getWidth();

    const pdfHeight =
    pdf.internal.pageSize.getHeight();

    const imgWidth =
    pdfWidth;

    const imgHeight =
    (canvas.height * imgWidth)
    / canvas.width;

    let heightLeft =
    imgHeight;

    let position = 0;

    pdf.addImage(

        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight

    );

    heightLeft -= pdfHeight;

    while(heightLeft > 0){

        position =
        heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(

            imgData,
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight

        );

        heightLeft -= pdfHeight;

    }

    pdf.save(
        "Earth_Resistance_Test_Report.pdf"
    );

}

function updateMap(){

    const url =
    document.getElementById("mapUrl").value;

    document.getElementById("mapFrame").src =
    url;

}

function previewImage(event,id){

    const file =
    event.target.files[0];

    if(file){

        const reader =
        new FileReader();

        reader.onload=function(e){

            document.getElementById(id).src =
            e.target.result;

        }

        reader.readAsDataURL(file);

    }

}

async function generateProfessionalPDF(){

    calculateData();

    await new Promise(resolve =>
        setTimeout(resolve, 800)
    );

    let chartImage = "";

    if(chart){

        chartImage =
        chart.canvas.toDataURL(
            "image/png",
            1.0
        );

    }

    const instrumentRows =
    document.querySelectorAll(
        "#instrumentTable tbody tr"
    );

    let instruments = [];

    instrumentRows.forEach(row=>{

        const inputs =
        row.querySelectorAll("input");

        instruments.push({

            no:row.cells[0].innerText,

            type:inputs[0].value,

            serial:inputs[1].value,

            due:inputs[2].value

        });

    });

    const observationRows =
    document.querySelectorAll(
        "#readingTable tbody tr"
    );

    let observations = [];

    observationRows.forEach(row=>{

        const inputs =
        row.querySelectorAll("input");

        observations.push({

            distance:inputs[0].value,

            voltage:inputs[1].value,

            current:inputs[2].value,

            resistance:
            row.querySelector(
                ".resistance-cell"
            ).innerText

        });

    });

    const data = {

        projectName:
        document.getElementById(
            "projectName"
        ).value,

        projectReference:
        document.getElementById(
            "projectReference"
        ).value,

        location:
        document.getElementById(
            "location"
        ).value,

        engineer:
        document.getElementById(
            "engineer"
        ).value,

        weather:
        document.getElementById(
            "weather"
        ).value,

        avg:
        document.getElementById(
            "avgResistance"
        ).innerText,

        distance62:
        document.getElementById(
            "distance62"
        ).innerText,

        equivalent:
        document.getElementById(
            "equivalentResistance"
        ).innerText,

        deviation:
        document.getElementById(
            "maxDeviation"
        ).innerText,

        status:
        document.getElementById(
            "accuracyStatus"
        ).innerText,

        remarks:
        document.getElementById(
            "remarks"
        ).value,

        map:
        document.getElementById(
            "mapUrl"
        ).value,

        chart:chartImage,

        img1:
        document.getElementById(
            "img1"
        ).src,

        img2:
        document.getElementById(
            "img2"
        ).src,

        desc1:
        document.getElementById(
            "desc1"
        ).value,

        desc2:
        document.getElementById(
            "desc2"
        ).value,

        instruments,
        observations

    };

    localStorage.setItem(
        "earthReport",
        JSON.stringify(data)
    );

    window.open("pdf.html");

}

if(window.location.pathname.includes("pdf.html")){

    const data =
    JSON.parse(
        localStorage.getItem("earthReport")
    );

    if(data){

        document.getElementById(
            "pdfProjectName"
        ).innerText =
        data.projectName;

        document.getElementById(
            "pdfProjectReference"
        ).innerText =
        data.projectReference;

        document.getElementById(
            "pdfLocation"
        ).innerText =
        data.location;

        document.getElementById(
            "pdfEngineer"
        ).innerText =
        data.engineer;

        document.getElementById(
            "pdfWeather"
        ).innerText =
        data.weather;

        document.getElementById(
            "pdfAvg"
        ).innerText =
        data.avg;

        document.getElementById(
            "pdfDistance"
        ).innerText =
        data.distance62;

        document.getElementById(
            "pdfEquivalent"
        ).innerText =
        data.equivalent;

        document.getElementById(
            "pdfDeviation"
        ).innerText =
        data.deviation;

        document.getElementById(
            "pdfStatus"
        ).innerText =
        data.status;

        document.getElementById(
            "pdfRemarks"
        ).innerText =
        data.remarks;

        document.getElementById(
            "pdfMap"
        ).src =
        data.map;

        document.getElementById(
            "pdfImg1"
        ).src =
        data.img1;

        document.getElementById(
            "pdfImg2"
        ).src =
        data.img2;

        document.getElementById(
            "pdfDesc1"
        ).innerText =
        data.desc1;

        document.getElementById(
            "pdfDesc2"
        ).innerText =
        data.desc2;

        /* CHART */

        const chartImage =
        document.getElementById(
            "pdfChartImage"
        );

        chartImage.src =
        data.chart;

        /* INSTRUMENT TABLE */

        let instrumentHTML = `

            <tr>
                <th>No</th>
                <th>Type</th>
                <th>Serial</th>
                <th>Calibration Due</th>
            </tr>

        `;

        data.instruments.forEach(item=>{

            instrumentHTML += `

                <tr>

                    <td>${item.no}</td>
                    <td>${item.type}</td>
                    <td>${item.serial}</td>
                    <td>${item.due}</td>

                </tr>

            `;

        });

        document.getElementById(
            "pdfInstrumentTable"
        ).innerHTML =
        instrumentHTML;

        /* OBSERVATION TABLE */

        let observationHTML = `

            <tr>

                <th>Distance</th>
                <th>Voltage</th>
                <th>Current</th>
                <th>Resistance</th>

            </tr>

        `;

        data.observations.forEach(item=>{

            observationHTML += `

                <tr>

                    <td>${item.distance}</td>
                    <td>${item.voltage}</td>
                    <td>${item.current}</td>
                    <td>${item.resistance}</td>

                </tr>

            `;

        });

        document.getElementById(
            "pdfObservationTable"
        ).innerHTML =
        observationHTML;

        /* WAIT FOR IMAGE LOADS */

        Promise.all(

            Array.from(
                document.images
            ).map(img => {

                if(img.complete){
                    return Promise.resolve();
                }

                return new Promise(resolve=>{
                    img.onload = resolve;
                    img.onerror = resolve;
                });

            })

        ).then(()=>{

            setTimeout(()=>{

                async function downloadPDFDirectly(){

    const { jsPDF } =
    window.jspdf;

    const pdf =
    new jsPDF(
        "p",
        "mm",
        "a4"
    );

    const pages = [

        document.getElementById("pdfPage1"),

        document.getElementById("pdfPage2")

    ];

    for(let i=0;i<pages.length;i++){

        const canvas =
        await html2canvas(
            pages[i],
            {
                scale:2,
                useCORS:true
            }
        );

        const imgData =
        canvas.toDataURL("image/png");

        const pdfWidth =
        210;

        const pdfHeight =
        (
            canvas.height *
            pdfWidth
        ) / canvas.width;

        if(i !== 0){
            pdf.addPage();
        }

        pdf.addImage(

            imgData,
            "PNG",
            0,
            0,
            pdfWidth,
            pdfHeight

        );

    }

    pdf.save(
        "Earth_Resistance_Test_Report.pdf"
    );

}

            },1000);

        });

    }

}

if(document.getElementById("resistanceChart")){

    updateMap();

    calculateData();

}