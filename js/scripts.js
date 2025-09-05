let MovieHelper;

// Function to load the MovieHelper module
async function loadMovieHelper() {
    if (!MovieHelper) {
        const module = await import('./MovieHelper.js')
        MovieHelper = module.default
    }
    return MovieHelper
}

let movieListComponent = {
  movies: [],
  filter_year: '',
  error: null,
  init() {
    this.loadMovies()
  },
  async loadMovies() {

    // Load MovieHelper class
    const MovieHelper = await loadMovieHelper()

    // Get movies from API, using await because getMovies is an async function
    // If filter_year is set, change what movies we load from the API
    // You could do this by calling a different method, or passing arguments into getMovies()
    this.movies = await MovieHelper.getMovies()
  }
}