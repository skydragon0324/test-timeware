
const API_URL = 'https://app.astroport.fi/api/trpc/charts.prices';
const IBC_TOKEN = "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9";
const UNTRN_TOKEN = "untrn";

window.onload = async function() {
  try {
    const data = await fetchData();
    const chartData = data.result.data.json;
    renderChart(chartData);
    showDetils(chartData);
  } catch (error) {
    console.log("error", error);
    throw new Error(error);
  }
}

const fetchData = async () => {
  const json = {
    "json": {
       "tokens": [
          IBC_TOKEN,
          UNTRN_TOKEN
       ],
       "chainId": "neutron-1",
       "dateRange": "D7"
    }
  };
  const jsonStr = JSON.stringify(json);
  const encodedQuery = encodeURIComponent(jsonStr);

  const res = await fetch(`${API_URL}?input=${encodedQuery}`);
  if(!res.ok) {
    throw new Error("Fail to fetch data");
  }
  return res.json();
}


const renderChart = (chartData) => {
  const ibc_data = chartData[IBC_TOKEN].series;
  const untrn_data = chartData[UNTRN_TOKEN].series;
  var chart = new CanvasJS.Chart("timewave_chart", {
    zoomEnabled: true,
    zoomType: "xy",
    exportEnabled: true,
    title: {
      text: "Timewave 7-days price chart",
      fontSize: 36,
      fontColor: 'red'
    },
    axisX: {
      valueFormatString: "DD MMM YYYY",
      title: "Date/Time"
    },
    axisY: {
      title: "Price",
      titleFontColor: "#4F81BC",
      labelFontColor: "#480ef3",
      fontWeight: 700,
    },
    toolTip: {
      shared: true,
      contentFormatter: function(e) {
          let tooltipContent = '<strong>Date:</strong> ' + CanvasJS.formatDate(e.entries[0].dataPoint.x, "DD MMM YYYY") + '<br/>';
          e.entries.forEach(function(entry) {
              tooltipContent += '<strong class=\'text-primary\'>' + entry.dataSeries.name + ':</strong> ' + entry.dataPoint.y + '$ <br/>';
          });
          return tooltipContent;
      }
    },
    data: [{
      type: "line",
      name: "IBC",
      showInLegend: true,
      yValueFormatString: "###0.00 $",
      dataPoints: getPoints(ibc_data)
    },
    {
      type: "line",
      name: "UNTRN",
      color: "#C0504E",
      showInLegend: true,
      yValueFormatString: "###0.00 $",
      dataPoints: getPoints(untrn_data)
    }]
  });
  chart.render();
}

const  getPoints = (data) => {
	const dataPoints = data.map((item) => {
    return { x: new Date(item.time * 1000), y: item.value }
  });
	return dataPoints
}

const showDetils = (chartData) => {
  const ibc_data = chartData[IBC_TOKEN].series;
  const untrn_data = chartData[UNTRN_TOKEN].series;

  const ibc_average = ibc_data.reduce((a, b) => a += b.value, 0)/ ibc_data.length;
  const untrn_average = untrn_data.reduce((a, b) => a += b.value, 0)/ ibc_data.length;

  const details = document.getElementById("details");
  details.innerHTML = `
    <div class="col-md-4">
      <div class="card shawdow">
          <div class="card-body">
              <h6 class="card-title text-success">IBC Token</h6>
              <ul class="list-unstyled">
                  <li><strong>Average:</strong> $${ibc_average.toFixed(2)}</li>
                  <li><strong>MAX price:</strong> $${chartData[IBC_TOKEN].maxValue}</li>
                  <li><strong>Min price:</strong> $${chartData[IBC_TOKEN].minValue}</li>
              </ul>
          </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card shawdow">
          <div class="card-body">
              <h6 class="card-title text-primary">UNTRN Token</h6>
              <ul class="list-unstyled">
                  <li><strong>Average:</strong> $${untrn_average.toFixed(2)}</li>
                  <li><strong>MAX price:</strong> $${chartData[UNTRN_TOKEN].maxValue}</li>
                  <li><strong>Min price:</strong> $${chartData[UNTRN_TOKEN].minValue}</li>
              </ul>
          </div>
      </div>
    </div>
  `;
}
