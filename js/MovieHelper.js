
export default class MovieHelper {
  constructor() {
    // Define our API root URL, we can then add specific paths onto the end for different queries
    this.api_root = "https://api.themoviedb.org/3";
    // Define our API key here
    this.api_key =
      "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YzlkZDAxN2UwM2NkZWUzOTQ5ZGRiZGYxZTlkYmM0NCIsIm5iZiI6MTc1NjgyMDU3NC44MTEsInN1YiI6IjY4YjZmNDVlMDQ3ZDJhYjViZDIwMTc4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9Y-HRmGvnkS5jESMOKatDyJoypkpQrOYe4MMoRXpHGg";
  }

  async apiRequest(endpoint) {
    let url = `${this.api_root}/${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.api_key}`,
        },
      });

      if(!response.ok) {
        throw new Error()
      }
      return response;
    } catch (error) {
      console.error("Error fetching: ", error);
    }
  }

async getMovies() {
  const response = await this.apiRequest("discover/movie");
  const json = await response.json();
  console.log(json.results)
  return json.results;
}

async getMoviesByYear(year) {
  const response = await this.apiRequest(`discover/movie?primary_release_year=${year}&region=GB&vote_count.gte=50`);
  const json = await response.json();
  return json.results;
}

async getMoviesByRuntime(minRuntime, maxRuntime) {
  let endpoint = `discover/movie?with_runtime.gte=${minRuntime}`;
  
  if (maxRuntime) {
    endpoint += `&with_runtime.lte=${maxRuntime}`;
  }
  
  endpoint += "&region=GB&vote_count.gte=50";
  
  const response = await this.apiRequest(endpoint);
  const json = await response.json();
  return json.results;
}

async getMoviesByGenre(genreId) {
  const response = await this.apiRequest(`discover/movie?with_genres=${genreId}`)
  const json = await response.json()
  return json.results;
}

async getGenres() {
  const response = await this.apiRequest("genre/movie/list");
  const json = await response.json();
  return json.genres;
}

async getMoviesWithFilters(filters = {}) {
  let params = [];
  
  if (filters.year) {
    params.push(`primary_release_year=${filters.year}`);
  }
  
  if (filters.genre) {
    params.push(`with_genres=${filters.genre}`);
  }
  
  if (filters.minRuntime) {
    params.push(`with_runtime.gte=${filters.minRuntime}`);
  }
  
  if (filters.maxRuntime) {
    params.push(`with_runtime.lte=${filters.maxRuntime}`);
  }
  
  // Add default parameters for better results
  params.push("region=GB");
  params.push("vote_count.gte=50");
  
  const endpoint = `discover/movie?${params.join('&')}`;
  
  const response = await this.apiRequest(endpoint);
  const json = await response.json();
  return json.results;
}

async searchMovies(query) {
  const response = await this.apiRequest(`search/movie?query=${encodeURIComponent(query)}&region=GB`);
  const json = await response.json();
  return json.results;
}

async getMovieDetails(movieId){
  const response = await this.apiRequest(`movie/${movieId}`);
  const json = await response.json();
  return json;
}

async getMovieCast(movieId){
  const response = await this.apiRequest(`movie/${movieId}/credits`);
  const json = await response.json();
  const cast = json.cast
  const castList = cast.slice(0, 5)
  return castList;
}

}