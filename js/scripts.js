let MovieHelper;

// Function to load the MovieHelper module
async function loadMovieHelper() {
  if (!MovieHelper) {
    const module = await import("./MovieHelper.js");
    MovieHelper = module.default;
  }
  return MovieHelper;
}

// Helper function to get parameter from URL
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

let movieListComponent = {
  movies: [],
  filter_year: "",
  search_query: "",
  loading: false,
  error: "",
  init() {
    this.loadMovies();
  },

  async loadMovies() {
    this.loading = true;

    try {
      const MovieHelper = await loadMovieHelper();

      const movieHelper = new MovieHelper();

      if (this.search_query) {
        this.movies = await movieHelper.searchMovies(this.search_query);
      } else if (this.filter_year) {
        this.movies = await movieHelper.getMoviesByYear(this.filter_year);
      } else {
        this.movies = await movieHelper.getMovies();
      }
    } catch (error) {
      console.error("Error loading movies:", error);
      this.error = "Failed to load movies";
      this.movies = [];
    } finally {
      this.loading = false;
    }
  },
};

let movieComponent = {
  movie: null,
  loading: false,
  error: null,
  init() {
    const movie_id = getUrlParam("movie_id");

    if (movie_id) {
      this.loadMovie(movie_id);
    }
  },
  async loadMovie(movie_id) {
    const MovieHelper = await loadMovieHelper();

    const movieHelper = new MovieHelper();

    this.movie = await movieHelper.getMovieDetails(movie_id);
  },
};
