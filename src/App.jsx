import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import StarRating from "./hooks/StarRating";
import { useMovies } from "./hooks/useMovies";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { useKey } from "./hooks/useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f84fc31d";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return (
    <p className="text-center uppercase text-[2rem] font-semibold m-[4.8rem]">
      Loading...
    </p>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="text-center text-[2rem] p-[4.8rem]">
      <span>⛔️</span> {message}
    </p>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};
function NavBar({ children }) {
  return (
    <nav className="grid grid-cols-3 items-center h-[7.2rem] px-[3.2rem] bg-[var(--color-primary)] rounded-[0.9rem]">
      <Logo />
      {children}
    </nav>
  );
}

NavBar.propTypes = {
  children: PropTypes.node.isRequired,
};
function Logo() {
  return (
    <div className="flex items-center gap-[0.8rem]">
      <span className="text-[3.2rem]">🍿</span>
      <h1 className="text-[2.4rem] font-semibold text-[#fff]">Popcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(function () {
    inputEl.current.focus();
  }, []);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;

    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search justify-self-center border-none py-[1.1rem] px-[1.6rem] text-[1.8rem] rounded-[0.7rem] w-[40rem] bg-[var(--color-primary-light)] text-[var(--color-text)] transition-all placeholder:text-[var(--color-text-dark)]"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

Search.propTypes = {
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
};

function NumResults({ movies }) {
  return (
    <p className="justify-self-end text-[1.8rem]">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

NumResults.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      imdbID: PropTypes.string.isRequired,
      Title: PropTypes.string.isRequired,
      Year: PropTypes.string.isRequired,
      Poster: PropTypes.string.isRequired,
    })
  ).isRequired,
};

function Main({ children }) {
  return (
    <main className="mt-[2.4rem] h-[calc(100vh-7.2rem-3*2.4rem)] flex gap-[2.4rem] justify-center">
      {children}
    </main>
  );
}

Main.propTypes = {
  children: PropTypes.node.isRequired, // تعیین نوع children
};

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-[42rem] max-w-[42rem] bg-[var(--color-background-500)] rounded-[0.9rem] relative">
      <button
        className="absolute top-[0.8rem] aspect-square right-[0.8rem] h-[2.4rem] rounded-full border-none bg-[var(--color-background-900)] text-[var(--color-text)] text-[1.4rem] font-bold cursor-pointer z-[999]"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

Box.propTypes = {
  children: PropTypes.node.isRequired,
};

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list-none py-[0.8rem] list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

MovieList.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      imdbID: PropTypes.string.isRequired,
      Title: PropTypes.string.isRequired,
      Year: PropTypes.string.isRequired,
      Poster: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSelectMovie: PropTypes.func.isRequired,
};

function Movie({ movie, onSelectMovie }) {
  return (
    <li
      className="list cursor-pointer hover:bg-[var(--color-background-100)] transition-all"
      onClick={() => onSelectMovie(movie.imdbID)}
    >
      <img
        className="w-[100%] row-span-full"
        src={movie.Poster}
        alt={`${movie.Title} poster`}
      />
      <h3 className="text-[1.8rem] font-bold">{movie.Title}</h3>
      <div className="flex items-center gap-[2.4rem]">
        <p className="flex items-center gap-[0.8rem]">
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

Movie.propTypes = {
  movie: PropTypes.shape({
    imdbID: PropTypes.string.isRequired,
    Title: PropTypes.string.isRequired,
    Year: PropTypes.string.isRequired,
    Poster: PropTypes.string.isRequired,
  }).isRequired,
  onSelectMovie: PropTypes.func.isRequired,
};

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) {
        countRef.current++;
      }
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
        // console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]
  );

  return (
    <div className="leading-6 text-[1.4rem]">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header className="flex">
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img
              className="w-[33%]"
              src={poster}
              alt={`Poster of ${movie} movie`}
            />
            <div className="w-[100%] bg-[var(--color-background-100)] py-[1.4rem] px-[3rem] flex flex-col gap-[1.8rem]">
              <h2 className="text-[2.4rem] mt-[1rem] mb-[0.3rem] leading-[1.1] font-bold">
                {title}
              </h2>
              <p className="flex items-center ">
                {released} &bull; {runtime}
              </p>
              <p className="flex items-center ">{genre}</p>
              <p className="flex items-center gap-[0.8rem]">
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section className="flex flex-col gap-[1.6rem] p-[4rem]">
            <div className="bg-[var(--color-background-100)] rounded-[0.9rem] py-[2rem] px-[2.4rem] mb-[0.8rem] font-semibold flex flex-col gap-[2.4rem]">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button
                      className="bg-[var(--color-primary)] text-[var(--color-text)] border-none rounded-[10rem] text-[1.4rem] p-[1rem] font-bold cursor-pointer transition-all hover:bg-[var(--color-primary-light)]"
                      onClick={handleAdd}
                    >
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <p className="leading-8">
              <em>{plot}</em>
            </p>
            <p className="leading-8">Starring {actors}</p>
            <p className="leading-8">Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

MovieDetails.propTypes = {
  selectedId: PropTypes.string.isRequired,
  onCloseMovie: PropTypes.func.isRequired,
  onAddWatched: PropTypes.func.isRequired,
  watched: PropTypes.arrayOf(
    PropTypes.shape({
      imdbID: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      year: PropTypes.string.isRequired,
      poster: PropTypes.string.isRequired,
      imdbRating: PropTypes.number.isRequired,
      runtime: PropTypes.number.isRequired,
      userRating: PropTypes.number,
    })
  ).isRequired,
};

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary pt-[2.2rem] pb-[1.8rem] px-[3.2rem] rounded-[0.9rem] bg-[var(--color-background-100)]">
      <h2 className="font-bold uppercase text-[1.6rem] mb-[0.6rem]">
        Movies you watched
      </h2>
      <div className="flex items-center gap-[2.4rem] text-[1.6rem] font-semibold">
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

WatchedSummary.propTypes = {
  watched: PropTypes.arrayOf(
    PropTypes.shape({
      imdbID: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      imdbRating: PropTypes.number.isRequired,
      userRating: PropTypes.number,
      runtime: PropTypes.number.isRequired,
    })
  ).isRequired,
};

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list-none py-[0.8rem] px-[0]">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

WatchedMoviesList.propTypes = {
  watched: PropTypes.arrayOf(
    PropTypes.shape({
      imdbID: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      poster: PropTypes.string.isRequired,
      imdbRating: PropTypes.number.isRequired,
      userRating: PropTypes.number,
      runtime: PropTypes.number.isRequired,
    })
  ).isRequired,
  onDeleteWatched: PropTypes.func.isRequired,
};

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li className="list">
      <img
        className="w-[100%] row-span-full"
        src={movie.poster}
        alt={`${movie.title} poster`}
      />
      <h3 className="text-[1.8rem] font-bold">{movie.title}</h3>
      <div className="flex items-center gap-[2.4rem]">
        <p className="flex items-center gap-[0.8rem]">
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p className="flex items-center gap-[0.8rem]">
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p className="flex items-center gap-[0.8rem]">
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

WatchedMovie.propTypes = {
  movie: PropTypes.shape({
    imdbID: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    poster: PropTypes.string.isRequired,
    imdbRating: PropTypes.number.isRequired,
    userRating: PropTypes.number,
    runtime: PropTypes.number.isRequired,
  }).isRequired,
  onDeleteWatched: PropTypes.func.isRequired,
};
