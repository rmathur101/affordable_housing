var content = `
        <div id="main-app" style="display: none;" class="row">
            <div class="col-sm-6">
                <h4 style="margin-left: 20px;">Affordable Housing Austin, TX</h4>
                <div id="mapid" style="height: 600px; border: 2px solid black; margin-left: 20px"></div>
                <div style="margin-left: 20px">
                    NOTE: This data has issues. Like, do districts 6 and 10 really not have ANY affordable housing now? <a href="https://data.austintexas.gov/Building-and-Development/Affordable-Housing-Inventory-AHI-/x5p7-qyuv">This is where our data comes from.</a> We want to get plugged into a real time database from the city. If you're on board or know someone who can help, leave a note in the Feedback!
                </div>
            </div>
            <div class="col-sm-6">
                <br /><br />
                <span>Districts: </span>
                <select id="select-district">
                    <option vale="all">ALL</option>
                    <option value="1">District 1</option>
                    <option value="2">District 2</option>
                    <option value="3">District 3</option>
                    <option value="4">District 4</option>
                    <option value="5">District 5</option>
                    <option value="6">District 6</option>
                    <option value="7">District 7</option>
                    <option value="8">District 8</option>
                    <option value="9">District 9</option>
                    <option value="10">District 10</option>
                </select>
                <br />
                <span>Affordability Expiration Date Range: </span>
                <input id ="datepicker1"></input>
                <input id ="datepicker2"></input>
                <br />
                <span>Household Yearly Income: </span><input id="household-yearly-income" />
                <br />
                <button id="search-matching-properties">Search Matching Properties</button>
                <br />
                <br /><br />
                <img id="loader" src="./imgs/loader.gif" />
                <div id="data-content">
                    <div><b>Affordable Projects:</b> <span id="AFI-Total"></span></div>
                    <div><b>Affordable Units (<= 80% MFI):</b> <span id="AFI-Affordable"></span></div>
                    <div><b>Market Rate Units:</b> <span id="AFI-Market-Rate-Units"></span></div>
                    <div><b>City Funding: $</b><span id="city-funded-amount-total"></span></div>

                    <div id="chart_div" style="width: 350px;"></div>
                    <div id="chart-kirwan" style="width: 350px;"></div>
                    <div id="chart-program" style="width: 350px;"></div>

                    <!-- <div><b>Total Affordable Units <= 30% MFI:</b> <span id="AFI-Less-30-Units"></span></div>
                    <div><b>Total Affordable Units <= 40% MFI:</b> <span id="AFI-Less-40-Units"></span></div>
                    <div><b>Total Affordable Units <= 50% MFI:</b> <span id="AFI-Less-50-Units"></span></div>
                    <div><b>Total Affordable Units <= 60% MFI:</b> <span id="AFI-Less-60-Units"></span></div>
                    <div><b>Total Affordable Units <= 80% MFI:</b> <span id="AFI-Less-80-Units"></span></div> -->
                    <br />
                    <div id="marker-info"></div>

                </div>
            </div>
        </div>
`
module.exports.content = content;
