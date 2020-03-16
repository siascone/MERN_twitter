import { connect } from 'react-redux';
import { fetchUserTweets } from '../../actions/tweet_actions';
import Profile from './profile';

const mapSTP = (state) => {
    return {
        tweets: Object.values(state.tweets.user),
        currentUser: state.session.user
    };
};

const mapDTP = dispatch => {
    return {
        fetchUserTweets: id => dispatch(fetchUserTweets(id))
    };
};

export default connect(mapSTP, mapDTP)(Profile);

