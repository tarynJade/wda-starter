// All of our API logic can go in here
// We can interact with our API via this class
// export default class MovieHelper {

//     constructor() {
//         // Define our API root URL, we can then add specific paths onto the end for different queries
//         this.api_root = "https://api.themoviedb.org/3"
//         // Define our API key here
//         this.api_key = "YOUR_API_KEY"
//     }

//     // Use the API endpoint documented on this page: https://developer.themoviedb.org/reference/discover-movie
//     static async getMovies() {
//         // Replace this with actual movie results from an API call using fetch()
//         return ['KPop Demon Hunters', 'I Know What You Did Last Summer', 'The Matrix']
//     }

// }

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
  return json.results;
}

async getMoviesByYear(year) {
  const response = await this.apiRequest(`discover/movie?primary_release_year=${year}&region=GB&vote_count.gte=50`);
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

}