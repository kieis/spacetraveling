/* eslint-disable prettier/prettier */
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiUser, FiCalendar } from "react-icons/fi";
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';

import styles from './home.module.scss';
import dateFormat from '../utils/dateFormat';
import { useRouter } from 'next/router';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [postPagination, setPostPagination] = useState<PostPagination | null>(postsPagination);

  function LoadNextPage(): void {
    fetch(postPagination.next_page)
    .then((response) => response.json())
    .then((data) => {
      const posts = data.results.map((post) => {
        return {
          uid: post.uid,
          first_publication_date: dateFormat(post.first_publication_date),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author
          },
        }
      });

      const pagination: PostPagination = {
        next_page: data.next_page,
        results: [...postPagination.results, ...posts],
      };

      setPostPagination(pagination);
    });
  }

  useEffect(() => {
    setPostPagination(postsPagination);
  }, [postsPagination]);

  return (
    <section className={styles.homeContainer}>
      {postPagination && postPagination.results.map((post) => {
        return (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a className={styles.post}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.postInfo}>
                <span><FiCalendar/>{dateFormat(post.first_publication_date)}</span>
                <span><FiUser/>{post.data.author}</span>
              </div>
            </a>
          </Link>
        )
      })}

      {postPagination.next_page && <button type='button' onClick={LoadNextPage}>Carregar mais posts</button>} 
    </section>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 2,
  });

  const posts = postsResponse.results.map((post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      },
    }
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      }
    },
    revalidate: 60 * 60, //1 hour
  };
};
