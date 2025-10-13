let MovieHelper;

// Function to load the MovieHelper module
async function loadMovieHelper() {
  if (!MovieHelper) {
    const module = await import("./MovieHelper.js");
    MovieHelper = module.default;
  }
  return MovieHelper;
}

// Create a helper to get MovieHelper instance
async function getMovieHelper() {
  const MovieHelperClass = await loadMovieHelper();
  return new MovieHelperClass();
}

// Helper function to get parameter from URL
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

let movieListComponent = {
  movies: [],
  genres: [],
  filter_year: "",
  filter_genre: "",
  filter_runtime: "",
  search_query: "",
  loading: false,
  error: "",

  async init() {
    this.loadPersistedFilters();
    await this.loadGenres(); // Load genres first
    await this.loadMovies();  // Then load movies
  },

  loadPersistedFilters() {
    
    this.filter_year = localStorage.getItem('movie_filter_year') || '';
    this.filter_genre = localStorage.getItem('movie_filter_genre') || '';
    this.filter_runtime = localStorage.getItem('movie_filter_runtime') || '';
    this.search_query = localStorage.getItem('movie_search_query') || '';
  },

  saveFilters() {
    localStorage.setItem('movie_filter_year', this.filter_year);
    localStorage.setItem('movie_filter_genre', this.filter_genre);
    localStorage.setItem('movie_filter_runtime', this.filter_runtime);
    localStorage.setItem('movie_search_query', this.search_query);
  },

  async loadGenres() { 
    try {
      const movieHelper = await getMovieHelper();
      this.genres = await movieHelper.getGenres();
    } catch (error) {
      console.error("Error loading genres:", error);
    }
  },

  // Parse runtime helper method
  parseRuntimeFilter() {
    if (!this.filter_runtime) return {};
    
    const runtimeMap = {
      'short': { maxRuntime: 90 },
      'medium': { minRuntime: 90, maxRuntime: 150 },
      'long': { minRuntime: 150 }
    };
    
    return runtimeMap[this.filter_runtime] || {};
  },

  async loadMovies() {
    this.saveFilters();
    this.loading = true;
    this.error = '';

    try {
      const movieHelper = await getMovieHelper();

      if (this.search_query) {
        this.movies = await movieHelper.searchMovies(this.search_query);
      } else if (this.filter_year || this.filter_genre || this.filter_runtime) {
        // Use combined filters
        this.movies = await movieHelper.getMoviesWithFilters({
          year: this.filter_year,
          genre: this.filter_genre,
          ...this.parseRuntimeFilter()
        });
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
    const movieHelper = await getMovieHelper();
    this.movie = await movieHelper.getMovieDetails(movie_id);
  },
};
