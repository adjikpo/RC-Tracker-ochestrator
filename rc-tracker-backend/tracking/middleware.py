from django.utils.deprecation import MiddlewareMixin

# tracking/middleware.py
class TokenFromCookieMiddleware(MiddlewareMixin):
    def process_request(self, request):
        print('Cookies reçus:', request.COOKIES)
        if 'access_token' in request.COOKIES and 'HTTP_AUTHORIZATION' not in request.META:
            token = request.COOKIES['access_token']
            print(f"Token trouvé dans le cookie: {token}")
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        else:
            print("Aucun token dans les cookies ou Authorization déjà présent")