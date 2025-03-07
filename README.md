#Movie Mates

Our project is a social movie app designed to make it easy for you and your friends to create movie-watching groups, schedule and plan out movie nights, and view each other’s reviews. The main page is the user’s Dashboard, allowing them to see their upcoming movie nights for all groups, a list of their groups, and a list of ‘Happenings’, those being notifications of actions related to users who are members of the user’s groups. The event and group cards link to the respective groups as well. Beneath that, a preview of that user’s full tier list, comprised of three tiers, is available to view, along with a button linking them to the full Tierlist page where they can edit the Tierlist itself. Beside that is the card containing either the user’s intended watchlist or a listing of reviews they have left for different movies. Swapping between either function in this card can let a user sort their watchlist or reviews.

We have a sidebar that allows users to easily navigate the site, from the dashboard, their groups, the tier list page, and their profile. The group dropdown not only shows all the user’s groups but allows them to either create or join new groups. Joining a group requires a group invite code, which can be found on that group’s page in the top left.

On each group’s page, users can see detailed information about that group, such as members, group happenings, and a full calendar displaying the scheduled movie nights. Admins or the group owner can schedule, edit, and delete movie nights for the group. We plan to continue growing this page with aggregated rating scores and an aggregated tier list.

See our project here: https://moviematesfrontend.onrender.com/

Once you’re on the dashboard, you just need to sign up, and then you will have full access to the project.

Technologies:
App was built on a React.js (vite) framework, connecting a MongoDB database with Mongoose and Node.js (Express, Axios)
Javascript, HTML, CSS, Tailwind
Authentication with Auth0
Deployed using Render
TMDB and OMDB APIs

Contributions:

Parker: I designed the project’s database, set up the MongoDB cluster, and implemented all of the backend schemas, routes, and controllers. I also connected the group page to the backend to display all of the group's data and created the group calendar which allows users to schedule, edit, and display movie nights.

Christian: I designed and implemented the tier list page to allow users to rank and order the movies they’ve watched. I also made the profile page and settings page and helped with the landing and movies pages.

Matthew: I connected our project to two free online movie database APIs to populate our app with movie data.  I also designed and implemented the landing page, the dashboard where users can easily see details about all their groups and movie nights, as well as their tier list, watchlist, and reviews, and the movie page where users can search for movies, see all the details about a move and do things like add them to their watchlist or review them.

Francesco: I designed and created the Group page as well as components including modals such as the Review Modal, Create/Join Group Modal, the Ticket Rating bar, toasts, and Group menu, full stack. I also set up and integrated authentication with Auth0, and made sure pages and components worked with our intended authentication designs.

Our Project Demo: https://youtu.be/jb0y7h1P2KM

