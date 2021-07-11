import React, { useState, useEffect } from "react";
import './App.css';
import { FormControl, Select , MenuItem, Card, CardContent} from "@material-ui/core"
import InfoBox from "./components/InfoBox";
import Map from "./components/Map";
import Table from "./components/Table";
import { sortData, prettyPrintStat } from "./utils";
import LineGraph from "./components/LineGraph";
import "leaflet/dist/leaflet.css";


function App() {

  const [countries, setCountries] = useState([]);
  const [country,setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  // considering the worldwide option on page load

  useEffect( () => {
    fetch("https://disease.sh/v3/covid-19/all").then(
      response => response.json()
    ).then(data => {
      setCountryInfo(data);
    })
  },[])


  // get countries from the api 
  // https://disease.sh/v3/covid-19/countries

  useEffect(() => {
    

    const getCountriesData = async () => {
      fetch('https://disease.sh/v3/covid-19/countries').then(
      response => response.json()
      ).then( (data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))

        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      })
    }

    getCountriesData();
  },[])

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    // if the option is worldwide 
    // https://disease.sh/v3/covid-19/all
    
    // Else Check for the country stats 
    // https://disease.sh/v3/covid-19/countries/{countryCodeHere}


    const url = countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url).then(
      response => response.json()
    ).then( data => {
      setCountry(countryCode);
      setCountryInfo(data);

      // handling the latitude and longitude od the map

      if(countryCode  === "worldwide") {
        setMapCenter([34.80746, -40.4796]);
        setMapZoom(3);
      }else {
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      }    
      
      
    })

    console.log("country info " , countryInfo);

  }

  return (
    
    <div className="app">

      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              { countries && countries.map((countryData) => (
                <MenuItem key={countryData.value} value={countryData.value}>{countryData.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
            <InfoBox isRed active={casesType === "cases"} onClick={e => setCasesType("cases")} title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)}  total={prettyPrintStat(countryInfo.cases)}/>
            <InfoBox active={casesType === "recovered"} onClick={e => setCasesType("recovered")} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>
            <InfoBox isRed active={casesType === "deaths"} onClick={e => setCasesType("deaths")} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
        </div>



        <Map center={mapCenter} zoom={mapZoom} countries={mapCountries} casesType={casesType} />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          { tableData && (
            <Table countries={tableData}/>
          )}
          <h3 className="app__graphTitle">WorldWide new {casesType}</h3>
        {/* Graph */}
        <LineGraph casesType={casesType} />
        </CardContent>
      </Card>
    </div>
    
  );
}

export default App;
