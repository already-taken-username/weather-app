import React from 'react';
import './style.css';

function setColor(output){
	
	const div = document.getElementById("hueRange");
	var setValue = false;

	if( typeof output === 'boolean' ){
		if( output && !div ){
			var input = document.createElement("input");
			input.setAttribute("type", "range");
			input.setAttribute("min", "0");
			input.setAttribute("max", "360");
			input.setAttribute("value", "198");
			input.setAttribute("oninput", "setColor()");
			input.setAttribute("id", "hueRange");
			document.getElementById("dayProgress").appendChild(input);
			setValue = 198;
		}else if( !output && div ){
			div.remove();
		}
	}else if( typeof output === 'number' && !div ){
		setValue = output;
	}else if( output === undefined && div ){
		setValue = document.getElementById("hueRange").value;
	}

	if( setValue ){
		document.documentElement.style.setProperty('--weather-hue', setValue);
		document.querySelector("meta[name=theme-color]").setAttribute('content', 'hsl(' + setValue + ',20%,17%)');
	}

}

class WeatherInformationBarButton extends React.Component{
	render(){
		return(
			<label title={this.props.title}>
				<input onChange={this.props.action} type="radio" name={this.props.name} value={this.props.value} defaultChecked={ this.props.checked ? true : null } />
				<i className={this.props.icon}></i>
			</label>
		)
	}
}

class WeatherInformationBar extends React.Component{
	render(){
		return(
			<div className='bar'>
				{ Object.keys(this.props.categories).map(key => 
					( this.props.categories[key].use !== false ?
						<div key={ this.props.categories[key].value }>
							<WeatherInformationBarButton 
								action={this.props.action}
								title={this.props.categories[key].title} 
								value={this.props.categories[key].value} 
								name={this.props.date} 
								icon={this.props.categories[key].icon} 
								checked={ this.props.selected === this.props.categories[key].value ? true : false }/>
						</div>
					: null )
				) }
			</div>
		)
	}
}

class WeatherInformation extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			categories: {
				'temperature': {
					class: 'celsius',
					data: ['main','temp'],
					round: true,
					title: 'Temperatura',
					value: 'temperature',
					icon: 'icon-temperature-0' 
				},
				'pressure': {
					class: 'pascal',
					data: ['main','pressure'],
					title: 'Ciśnienie',
					value: 'pressure',
					icon: 'icon-pressure-1'
				},
				'cloud': {
					class: 'percent',
					data: ['clouds','all'],
					title: 'Zachmurzenie',
					value: 'cloud',
					icon: 'icon-cloud'
				},
				'rainfall': {
					class: 'millimeter',
					data: ['downfall', '3h'],
					title: 'Opady',
					value: 'rainfall',
					icon: 'icon-rain-2'
				},
				'wind': {
					class: 'metersperseconds',
					data: ['wind','speed'],
					title: 'Wiatr',
					value: 'wind',
					icon: 'icon-wind' 
				},
				'humidity': {
					class: 'percent',
					data: ['main','humidity'],
					title: 'Wilgotność',
					value: 'humidity',
					icon: 'icon-humidity-outlined'
				},
				'test': {
					class:'testClass',
					data: [],
					title:'Test',
					value:'test',
					icon:'icon-localization-1',
					use: false
				}
			},
			selectedTab: 'temperature'
		};
		this.selectTab = this.selectTab.bind(this);
	}
	selectTab(e){
		const value = e.target.value;
		this.setState((state, props)=>{
			return {
				selectedTab: value
			};
		})
	}
	toLocaleShortTimeString(time){
		const date = new Date(time);
		return date.toLocaleTimeString().slice(0,-3)
	}
	render(){
		const category = this.state.categories[this.state.selectedTab];
		const data = this.props.data;
		return(
			<div className={ this.props.hide ? 'hideElement' : null }>
				<WeatherInformationBar categories={this.state.categories} date={data.date} action={this.selectTab} selected={this.state.selectedTab} />
				<div className='timeline'>
					{ data.weather.map( timestamp =>
						<div key={ timestamp.dt } style={{order: timestamp.dt}}>
							{ timestamp[category.data[0]][category.data[1]] ? 
								<p className={'unit ' + category.class}>
									{ category.round ? Math.round( timestamp[category.data[0]][category.data[1]] ) : timestamp[category.data[0]][category.data[1]] }
								</p>
								: 
								<p>-</p> }
							<i>
								<img src={'img/weather/' + timestamp.weather[0].icon + '.png'} alt={timestamp.weather[0].main + ' icon - ' + timestamp.weather[0].description} />
							</i>
							<b>{ this.toLocaleShortTimeString( timestamp.dt_txt ) }</b>
						</div>
					)}
				</div>
			</div>
		)
	}
}

class ProgressBar extends React.Component{
	constructor(props){
		super(props);
		const date = new Date();
		this.state = {
			countdown: 60,
			date: new Date(),
			sunrise: new Date( ( this.props.sunrise * 1000 ) - date.getTimezoneOffset() + this.props.timezone ),
			sunset: new Date( ( this.props.sunset * 1000 ) - date.getTimezoneOffset() + this.props.timezone ),
		};
	}
	componentDidMount(){
		this.tick();
		const timer = setInterval(
			() => this.tick(),
				1000
			);
		this.setState({
			timer: timer
		})
	}
	componentWillUnmount(){
		clearInterval(this.state.timer);
	}
	tick(){
		const date = new Date();
		const timezone = ( this.props.timezone + ( date.getTimezoneOffset() * 60 ) ) *  1000;
		this.setState({
			date: new Date( date.getTime() + timezone ),
			sunrise: new Date( ( this.props.sunrise * 1000 ) + timezone ),
			sunset: new Date( ( this.props.sunset * 1000 ) + timezone ),
		});
		setColor( parseFloat( ( ( this.timeToPercent('date') / 100 ) * 360 ).toFixed(3) ) );
	}
	timeToPercent(name){
		return ((((((this.state[name].getHours() * 60) + this.state[name].getMinutes()) * 60) + this.state[name].getSeconds()) / 86400 ) * 100).toFixed(3)
	}
	render(){
		const timeToSunrise = ((this.state.sunrise.getHours() * 60 + this.state.sunrise.getMinutes()) - (this.state.date.getHours() * 60 + this.state.date.getMinutes()));
		const timeToSunset = (this.state.sunset.getHours() * 60 + this.state.sunset.getMinutes()) - (this.state.date.getHours() * 60 + this.state.date.getMinutes());
		return(
			<div>
				<h3 title="wschód słońca">
					<i className="icon-horizon-sunrise"></i>
					{this.state.sunrise.toLocaleTimeString().slice(0, -3)}
					{ timeToSunrise <= this.state.countdown && timeToSunrise > 0 ?
						<span>&bull;<b className='unit minutes'>{timeToSunrise}</b></span> : null }
				</h3>
				<h3 title="aktualny czas">
					{this.state.date.toLocaleTimeString().slice(0, -3)}
				</h3>
				<h3 title="zachód słońca">
					{ timeToSunset <= this.state.countdown && timeToSunset > 0 ?
						<span><b className='unit minutes'>{timeToSunset}</b>&bull;</span> : null }
					{this.state.sunset.toLocaleTimeString().slice(0, -3)}
					<i className="icon-horizon-sunset"></i>
				</h3>
				<div className='progress' id='dayProgress'>
					<div style={{width: this.timeToPercent('sunrise') + '%'}}></div>
					<div style={{width: this.timeToPercent('sunset') + '%'}}></div>
					<div style={{width: this.timeToPercent('date') + '%'}}></div>
				</div>
			</div>
		)
	}
}

function toLocaleDayString(unixTimestamp){
	const date = new Date(unixTimestamp);
	switch( date.getDay() ){
		case 1:
			return 'Poniedziałek'
		case 2:
			return 'Wtorek'
		case 3:
			return 'Środa'
		case 4:
			return 'Czwartek'
		case 5:
			return 'Piątek'
		case 6:
			return 'Sobota'
		default:
			return 'Niedziela'
	}
}

class CurrentWeatherStatus extends React.Component{
	render(){
		if( this.props.value !== undefined ){
			return(
				<h3>
					{ this.props.rotate ? 
						<i className={this.props.icon} style={ {transform: 'rotate(' + this.props.rotate + 'deg)'} } ></i> 
						: 
						<i className={this.props.icon}></i> 
					}
					<p>
						{this.props.name}:
					</p>
					<span className={'unit ' + this.props.unit}>
						{this.props.value}
					</span>
				</h3>
			)
		}else{
			return(null)
		}
	}
}

class WeatherApp extends React.Component{
	render(){
		const data = this.props.data;
		if( String(data.cod) === '200' ){
			const weather = this.props.data;
			const date = new Date( weather.dt * 1000 );
			const downfall = function(){
				const value = ( weather.rain ? ( weather.rain.h3 ? weather.rain.h3 : 0 ) : 0 ) + ( weather.snow ? ( weather.snow.h3 ? weather.snow.h3 : 0 ) : 0 );
				return ( value > 0 ? value : undefined )
			}
			return(
				<section>
					<article>
						<h2>{weather.name}, {weather.sys.country}</h2>
						<div className='button' onClick={this.props.toggleSection} title={this.props.openLocalization ? 'zamknij opcje lokalizacji' : 'zmień lokalizacje'}>
							<i className='icon-localization-2'></i>
						</div>
						<h3>
						<span title={toLocaleDayString(weather.dt * 1000)}>{toLocaleDayString(weather.dt * 1000).substr(0,3)}</span> <span title="czas pobrania danych">{date.toLocaleTimeString().slice(0,-3)}</span>
							, <span title={weather.weather[0].description}>{weather.weather[0].main}</span>
						</h3>
						<h1 className='unit celsius'>{Math.round(weather.main.temp)}</h1>
						<i>
							<img src={'img/weather/' + weather.weather[0].icon + '.png'} alt={weather.weather[0].main + ' icon - ' + weather.weather[0].description} />
						</i>
						<ProgressBar sunrise={weather.sys.sunrise} sunset={weather.sys.sunset} timezone={weather.timezone} />
					</article>
					<article>
						<CurrentWeatherStatus icon='icon-arrow-outlined' name='wiatr' value={weather.wind.speed} rotate={weather.wind.deg} unit='metersperseconds' />
						<CurrentWeatherStatus icon='icon-pressure-1' name='ciśnienie' value={weather.main.pressure} unit='pascal' />
						<CurrentWeatherStatus icon='icon-humidity-outlined' name='wIlGoTnOśĆ' value={weather.main.humidity} unit='percent' />
						<CurrentWeatherStatus icon='icon-cloud' name='ZACHMURZENIE' value={weather.clouds.all} unit='percent' />
						<CurrentWeatherStatus icon='icon-visibility' name='WiDoCzNoŚć' value={weather.visibility} unit='meters' />
						<CurrentWeatherStatus icon='icon-rain-2' name='opady' value={downfall()} unit='millimeter' />
					</article>
				</section>
			)
		}
		return(
			<section>
				<PendingApp error={ data.message ? data.message : null } />
			</section>
		)
	}
}

class OneDayForecast extends React.Component{
	averageTemperature(){
		const data = this.props.data;

		var avg = 0,
			avgLow = 0,
			avgHigh = 0;
		var avgLowNumber = 0,
			avgHighNumber = 0;
		var weightLow = 0.1,
			weightHigh = 0.9;
		var sunrise = new Date(data.city.sunrise * 1000),
			sunset = new Date(data.city.sunset * 1000);

		data.weather.map(tick => {
			var now = new Date(tick.dt * 1000);
			if( sunrise.toLocaleTimeString().replace(/\:/g,'') < now.toLocaleTimeString().replace(/\:/g,'') && now.toLocaleTimeString().replace(/\:/g,'') < sunset.toLocaleTimeString().replace(/\:/g,'') ){
				avgHigh += tick.main.temp;
				avgHighNumber++;
			}else{
				avgLowNumber++;
				avgLow += tick.main.temp;
			}
		})
		avg = ( avgHigh * weightHigh + avgLow * weightLow ) / ( (avgLowNumber * weightLow) + (avgHighNumber * weightHigh) );
		return avg
	}
	render(){
		const data = this.props.data;
		return(
			<li key={data.date} style={{order: data.date}}>
				<label>
					<input type='radio' onClick={this.props.action} name='dailyForecast' value={data.date} checked={ this.props.selected === data.date } />
					<h3>
						<span>{toLocaleDayString(data.weather[0].dt * 1000)}</span>
						<span className='unit celsius'>{Math.round(this.averageTemperature())}</span>
					</h3>
				</label>
				<WeatherInformation data={ data } hide={ this.props.selected !== data.date } />
			</li>
		)
	}
}

class ForecastApp extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			selectedForecast: ''
		}
		this.selectDailyForecast = this.selectDailyForecast.bind(this);
	}
	selectDailyForecast(e){
		var outpur = ( this.state.selectedForecast === e.target.value ? null : e.target.value );
		this.setState((state, props)=>{
			return {
				selectedForecast: outpur
			};
		})
	}
	render(){
		const data = this.props.data;
		if( String(data.cod) === '200' ){
			const weather = this.props.data.list;
			const keys = Object.keys( weather );
			const date = function(){
				var date = new Date();
				var normalizeDate = function(number){
					number = String(number);
					var numberLength = number.length;
					return( numberLength >= 2 ? number : '0' + number ) 
				}
				const today = date.getFullYear() + normalizeDate( date.getMonth() + 1 ) + normalizeDate( date.getDate() );
				return today
			}
			return(
				<section>
					{ weather[date()] ?
						<article>
							<hr />
							<WeatherInformation data={{ date: date(), weather: weather[date()] }} />
						</article>
					: null }
					<article>
						<ul>
							{ keys.map( key =>
								( date() !== key ? 
									<OneDayForecast data={{ city: this.props.data.city, weather: weather[key], date: key}} key={key} action={this.selectDailyForecast} selected={this.state.selectedForecast} />
								: null )
							)}
						</ul>
					</article>
				</section>
			)
		}else{
			return(
				<PendingApp error={ data.message ? data.message : null } />
			)
		}
	}
}

class PendingApp extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			style: {
				display: 'grid',
				gridAutoFlow: 'column',
				gridGap: '24px',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '24px',
				backgroundColor: 'var(--weather-color-1)'
			}
		}
	}
	render(){
		return(
			<div style={ this.state.style }>
				<div className='pending'>
					{ this.props.error ? '!' : null }
				</div>
				{ this.props.error ? <h3>{this.props.error}</h3> : false }
			</div>
		)
	}
}

class LocalizationListElement extends React.Component{
	render(){
		const element = this.props.properties
		return(
			<label>
				<li className='button'>
					<span>{element.name}</span>
					<span>{element.country}</span>
				</li>
				<input type='button' value={element.id} onClick={element.action} />
			</label>
		)
	}
}

class AppLocalization extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			input: '',
			found: {},
			last: []
		}
		this.typeLocalization = this.typeLocalization.bind(this);
		this.searchLocalization = this.searchLocalization.bind(this);
	}
	typeLocalization(e){
		const value = e.target.value;
		this.setState((state,props)=>{
			return{
				input: value
			}
		})
	}
	searchLocalization(){
		const url = this.props.data.url + 'weather?q=' + this.state.input + '&appid=' + this.props.data.api;
		fetch(url)
			.then(response => response.json())
			.then(data => {
				if( String(data.cod) === '200' ){
					const city = {
						name: data.name,
						country: data.sys.country,
						coord: data.coord,
						id: data.id,
						cod: 200
					}
					var last = this.state.last;
					last.push(city);
					this.setState((state,props)=>{
						return{
							found: city,
							last: last
						}
					})
				}else{
					this.setState((state,props)=>{
						return{
							found: { 
								cod: 404,
								input: this.state.input
							}
						}
					})
				}
			} )
			.catch(error => { console.log(error) })
	}
	render(){
		return(
			<section id='localization' className={ !this.props.open ? 'hideElement' : null }>
				<label>
					<i className='icon-search'></i>
					<input type='text' onChange={this.typeLocalization} autoFocus />
				</label>
				<hr />
				<div className='button' onClick={this.props.callByLocalization} title='użyj autolokalizacji'>
					<i className='icon-localization-1'></i>    
				</div>
				<ul className={ this.state.input.length < 3 ? 'hideElement' : null }>
					<p>
						<li onClick={this.searchLocalization} className='button' >
							<i className='icon-search'></i> Szukaj
						</li>
						{ this.state.found.cod === 200 ?
							<LocalizationListElement 
								properties={{
									name: this.state.found.name,
									country: this.state.found.country,
									id: this.state.found.id,
									action: this.props.callByCityId
								}} />
						: <li className={ this.state.found.cod === 404 ? null : 'hideElement'}><i>Nie znaleziono</i></li> }
					</p>
				</ul>
			</section>
		)
	}
}

class App extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			fetch:{
				api: '5d33aafbe7cc14271bd32d9c75a32377',
				units: 'metric',
				lang: 'pl',
				url: 'http://api.openweathermap.org/data/2.5/',
				city: '7532248',
				position: {
					lat: '51',
					lon: '16'
				},
				useLocalization: false
			},
			openLocalizationSection: false,
			interval: {
				active: true,
				interval: 2700000
			},
			data: {
				weather: {
					cod: '404',
				},
				forecast: {
					cod: '404',
				}
			}
		}
		this.toggleLocalizationSection = this.toggleLocalizationSection.bind(this);
		this.callByLocalization = this.callByLocalization.bind(this);
		this.callByCityId = this.callByCityId.bind(this);
	}
	componentDidMount(){
		this.fetchForecast()
		this.fetchWeather()
		if( this.state.interval.active ){
			const timer = setInterval(
				() => this.refresh(),
					this.state.interval.interval
				);
			this.setState({
				timer: timer
			});
		}
	}
	componentWillUnmount(){
		if( this.state.timer ){
			clearInterval(this.state.timer);
		}
	}
	refresh(){
		this.fetchForecast()
		this.fetchWeather()
	}
	toggleLocalizationSection(){
		this.setState((state, props)=>{
			return {
				openLocalizationSection: !this.state.openLocalizationSection
			};
		})
	}
	fetchData(type){
		const url = 
			this.state.fetch.url + type + 
			( this.state.fetch.useLocalization ? ( '?lat=' + this.state.fetch.position.lat + '&lon=' + this.state.fetch.position.lon ) : ( '?id=' + this.state.fetch.city ) ) + 
			'&appid=' + this.state.fetch.api +
			'&units=' + this.state.fetch.units +
			'&lang=' + this.state.fetch.lang;
		return new Promise((resolve,reject)=>{
			fetch(url)
				.then(response => response.json())
				.then(data => {
					resolve(data)
				} )
				.catch(error => { reject(404) })
			});
	}
	callByCityId(e){
		const value = e.target.value;
		this.setState((state, props)=>{
			const fetch = this.state.fetch;
			return {
				openLocalizationSection: false,
				fetch: {
					useLocalization: false,
					position:{
						lat: fetch.position.lat,
						lon: fetch.position.lon
					},
					api: fetch.api,
					units: fetch.units,
					url: fetch.url,
					query: fetch.query,
					city: value,
					lang: fetch.lang
				}
			};
		}, ()=>{
			this.fetchWeather()
			this.fetchForecast()
		})
	}
	callByLocalization(){
		if( navigator.geolocation ){
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const fetch = this.state.fetch;
					this.setState((state, props)=>{
						return {
							openLocalizationSection: false,
							fetch: {
								useLocalization: true,
								position:{
									lat: position.coords.latitude,
									lon: position.coords.longitude
								},
								api: fetch.api,
								units: fetch.units,
								url: fetch.url,
								query: fetch.query,
								city: fetch.city,
								lang: fetch.lang
							}
						};
					}, ()=>{
						this.fetchWeather();
						this.fetchForecast();
					})
				},
				(error) => {
					alert(error.message);
					console.log(error);
				});
		}else{
			alert('Your browser is not supported.');
			console.log("Geolocation is not supported by this browser.");
		}
	}
	fetchWeather(){
		this.fetchData('weather').then(data => {
			if( String(data.cod) === '200' ){
				this.setState((state, props)=>{
					return {
						data: {
							weather: data,
							forecast: this.state.data.forecast
						},
					};
				})
			}else{
				this.setState((state, props)=>{
					return {
						data: {
							weather: {
								cod: ( data.cod ? String(data.cod) : '404' ),
								message: ( data.message ? data.message : 'błąd łączenia z serwerem' )
							},
							forecast: this.state.data.forecast
						}
					};
				})
			}
		})
	}
	fetchForecast(){
		this.fetchData('forecast').then(data => {
			if( String(data.cod) === '200' ){
				data.list.map((element, index)=>{
					const volume = ( element.rain ? element.rain['3h'] : 0 ) + ( element.snow ? element.snow['3h'] : 0 );
					data.list[index].downfall = {
						'3h': ( volume > 0 ? volume : null )
					}
				})
				const groupBy = key => array =>
					array.reduce((objectsByKeyValue, obj) => {
					const value = obj[key].split(' ')[0].replace(/-/g, '');
					objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
					return objectsByKeyValue;
				}, {});
				const groupByDate = groupBy('dt_txt');
				data.list = groupByDate(data.list);
				this.setState((state, props)=>{
					return {
						data: {
							weather: this.state.data.weather,
							forecast: data
						},
					};
				})
			}else{
				this.setState((state, props)=>{
					return {
						data: {
							weather: this.state.data.weather,
							forecast: {
								cod: ( data.cod ? String(data.cod) : '404' ),
								message: ( data.message ? data.message : 'błąd łączenia z serwerem' )
							}
						},
					};
				})
			}
		})
	}
	render(){
		return (
			<main id="app">
				<AppLocalization open={this.state.openLocalizationSection} callByLocalization={this.callByLocalization} callByCityId={this.callByCityId} data={this.state.fetch} />
				<WeatherApp data={this.state.data.weather} toggleSection={this.toggleLocalizationSection} openLocalization={this.state.openLocalizationSection} />
				<ForecastApp data={this.state.data.forecast} />
				<footer>
					<i>Powered by <a href='https://openweathermap.org' rel="nofollow license noopener noreferrer" target='_blank'>OpenWeatherMap.org</a></i>
				</footer>
			</main>
		)
	}
}

export default App;