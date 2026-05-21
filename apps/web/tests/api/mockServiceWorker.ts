import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/translations', ({ request }) => {
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang');

    if (lang === 'cg') {
      return HttpResponse.json({
        'place-1': { description: 'यह एक सुंदर झरना है (Mocked CG)' }
      });
    }

    if (lang === 'hi') {
      return HttpResponse.json({
        'place-1': { description: 'यह एक सुंदर झरना है (Mocked HI)' }
      });
    }

    return HttpResponse.json({});
  }),
];

export const worker = setupWorker(...handlers);
