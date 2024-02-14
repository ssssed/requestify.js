/*
	Examples
*/
import { request } from '../index';

type UserType = {
	userId: number;
	id: number;
	title: string;
	completed: boolean;
};

type PostType = {
	id: number;
	title: string;
	body: string;
	userId: number;
};

type PostParamsType = Omit<PostType, 'id'>;

// request
// 	.get<UserType[]>('https://jsonplaceholder.typicode.com/todos')
// 	.then(res => console.log('data :: ', res.data[0]));

// request
// 	.post<UserType, PostParamsType>(
// 		'https://jsonplaceholder.typicode.com/posts',
// 		{
// 			title: 'foo',
// 			body: 'bar',
// 			userId: 1,
// 		}
// 	)
// 	.then(res => console.log('post res :: ', res.data));

// request
// 	.put<PostType, PostType>('https://jsonplaceholder.typicode.com/posts/1', {
// 		title: 'foo',
// 		body: 'bar',
// 		userId: 1,
// 		id: 1,
// 	})
// 	.then(res => console.log('put res :: ', res.data));

// request
// 	.patch<PostType, Partial<PostType>>(
// 		'https://jsonplaceholder.typicode.com/posts/1',
// 		{
// 			title: 'foo',
// 		}
// 	)
// 	.then(res => console.log('patch res :: ', res.data));

// request
// 	.delete('https://jsonplaceholder.typicode.com/posts/1')
// 	.then(res => console.log('delete res :: ', res.ok, res.status));

const instance = request.create({
	baseUrl: 'https://jsonplaceholder.typicode.com',
	headers: {
		'Content-Type': 'application/json',
	},
	cache: {
		enabled: true,
	},
});

instance.interceptors.request.use(config => {
	return config;
});

type TodoParamsType = {
	limit: number;
};

// instance
// 	.get<UserType>('/todos/1')
// 	.then(res => console.log('data userId = 1 :: ', res.data));

instance
	.get<UserType, TodoParamsType>('/users', {
		limit: 2,
	})
	.then(res => console.log(res.status, res.ok))
	.then(() =>
		instance
			.get<UserType, TodoParamsType>('/users', {
				limit: 2,
			})
			.then(res => console.log(console.log(res.status, res.ok)))
	);

console.log(instance);
