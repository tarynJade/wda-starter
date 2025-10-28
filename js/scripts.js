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

// Shared watchlist utilities
const watchlistUtils = {
  load() {
    const saved = localStorage.getItem('movie_watchlist');
    return saved ? JSON.parse(saved) : [];
  },

  save(watchlist) {
    localStorage.setItem('movie_watchlist', JSON.stringify(watchlist));
  },

  isInWatchlist(watchlist, movieId) {
    return watchlist.some(movie => movie.id === movieId);
  },

  addToWatchlist(watchlist, movie) {
    if (!this.isInWatchlist(watchlist, movie.id)) {
      const updatedWatchlist = [...watchlist, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average
      }];
      this.save(updatedWatchlist);
      return updatedWatchlist;
    }
    return watchlist;
  },

  removeFromWatchlist(watchlist, movieId) {
    const updatedWatchlist = watchlist.filter(movie => movie.id !== movieId);
    this.save(updatedWatchlist);
    return updatedWatchlist;
  }
};

let movieListComponent = {
  movies: [],
  genres: [],
  watchlist: [],
  filter_year: "",
  filter_genre: "",
  filter_runtime: "",
  search_query: "",
  loading: false,
  error: "",

  async init() {

     if (this.initialized) {
      return;
    }

    this.initialized = true;

    this.loadPersistedFilters();
    await this.loadGenres();
    await this.loadMovies();
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

let watchlistComponent = {
  watchlist: [],
  loading: false,
  
  init() {
    this.loadWatchlist();
  },

  loadWatchlist() {
    this.watchlist = watchlistUtils.load();
  },

  removeFromWatchlist(movieId) {
    this.watchlist = watchlistUtils.removeFromWatchlist(this.watchlist, movieId);
  },

  clearWatchlist() {
    if (confirm('Are you sure you want to clear your entire watchlist?')) {
      this.watchlist = [];
      watchlistUtils.save(this.watchlist);
    }
  }
};

let movieComponent = {
  movie: null,
  watchlist: [],
  castList: [],
  trailer: null,
  recommendations: [],
  loading: false,
  error: null,
  movieId: null,
  
  init() {
    const movie_id = getUrlParam("movie_id");
    this.loadWatchlist();
    
    if (movie_id && movie_id !== this.movieId) { 
      this.loadMovie(movie_id);
    }
  },

  loadWatchlist() {
    this.watchlist = watchlistUtils.load();
    
  },

  isInWatchlist(movieId) {
    return watchlistUtils.isInWatchlist(this.watchlist, movieId);
  },

  addToWatchlist(movie) {
    this.watchlist = watchlistUtils.addToWatchlist(this.watchlist, movie);
  },

  removeFromWatchlist(movieId) {
    this.watchlist = watchlistUtils.removeFromWatchlist(this.watchlist, movieId);
  },

  toggleWatchlist(movie) {
    if (this.isInWatchlist(movie.id)) {
      this.removeFromWatchlist(movie.id);
    } else {
      this.addToWatchlist(movie);
    }
  },

  async loadMovie(movie_id) {
     if (this.loading || this.movieId === movie_id) {
      return;
     }
    
    this.movieId = movie_id;
    this.loading = true;
    this.error = null;
    try {
      const movieHelper = await getMovieHelper();
      this.movie = await movieHelper.getMovieDetails(movie_id);
      this.castList = await movieHelper.getMovieCast(movie_id);
      this.trailer = await movieHelper.getMovieTrailer(movie_id);
      const recommendationsData = await movieHelper.getMovieRecommendations(movie_id);
      this.recommendations = recommendationsData.results || [];
    } catch (error) {
      console.error("Error loading movie:", error);
      this.error = "Failed to load movie details";
    } finally {
      this.loading = false;
    }
  },
};

